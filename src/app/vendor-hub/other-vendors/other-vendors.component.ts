import { Component, OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ObservablesService } from '../../observables.service';
import { DatePipe } from '@angular/common'
import { environment } from '../../../environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-other-vendors',
  templateUrl: './other-vendors.component.html',
  styleUrls: ['./other-vendors.component.scss']
})
export class OtherVendorsComponent implements OnInit {
  host:any = environment.host
  myVendors:any = []
  myVendorsTemp:any = []
  userInfoSubscriber:any
  loggedUserInfo:any =null
  vendors:any = []
  vendorsTemp:any = []
  popoverIndex:any = ''
  searchSubscriber:any
  sortSubscriber:any
  showSpinner:boolean = true
  constructor(private router:Router, private route:ActivatedRoute, private datePipe:DatePipe, private observables:ObservablesService, private api:ApiService,private fb:FormBuilder) {

  }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
    this.searchSubscriber.unsubscribe()
    this.sortSubscriber.unsubscribe()
  }

  ngOnInit(): void {
    // console.log("Hello Other Vendors")
    this.loggedUserInfo = this.api.userInfo
    this.api.selectedPageStatus.next({title:'Other Vendor',searchStatus:true,backStatus:true})
    this.sortSubscriber = this.api.sortStatus.subscribe((res:any)=>{
      if(res.sortBy == "asc"){ 
          this.vendors= this.vendors.sort((a, b) => (a.company_name > b.company_name) ? 1 : -1);
      }else{
        this.vendors= this.vendors.sort((a, b) => (a.company_name > b.company_name) ? -1 : 1);
      }
       
    })

    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      if(this.loggedUserInfo){
        // console.log("loggedUserInfo=1",this.loggedUserInfo)
        // this.getPermissions()
        if(this.loggedUserInfo){
        //  this.getVendors()
         this.getVendors()
        }
      }
    })

    this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
      console.log("Searchig For==",searchTerm)
      if(searchTerm.length > 0){
        this.vendors = this.vendorsTemp.filter((item)=>{
          return (item.company_name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  
        });
      }else{
        this.vendors = this.vendorsTemp
      }
      
    })
 
    if(this.loggedUserInfo){
    //  this.getVendors()
     this.getVendors()
    }
  }

  checkLogo(item){
    if(item.logo){
      return true
    }else{
      return false
    }
  }

  getVendors(){
    this.api.send("findDb",{
      fields:["VP.*, I.i_name, S.s_name"],
      table:'vendor_parents as VP',
      joins:[{
        type:"left",
        table:"industries as I",
        conditions:["I.i_id = VP.industry"]
      },{
        type:"left",
        table:"sub_industries as S",
        conditions:["S.s_id = VP.sub_industry"]
      }],
      conditions:[{'VP.approval_status':1}]
    }).then((res:any)=>{
      
      this.getMyVendors().then((result:any)=>{

        let cars1IDs = new Set(this.myVendors.map(({ assign_vendor_id }) => assign_vendor_id));
        this.vendors = res.data.filter(({ vendor_id }) => {
          return !cars1IDs.has(vendor_id)
        })
        // console.log("vendors==",this.vendors)
        this.vendorsTemp = this.vendors
        this.showSpinner = false
      })
    }).catch((e)=>{
      this.showSpinner = false
      this.observables.showToastMessage({type:1,message:'Problem while showing Vendors.'});
    })
  }

  getMyVendors(){
    return new Promise((resolve)=>{
      this.api.send("findDb",{
        fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id, I.i_name, S.s_name"],
        table:'vendor_parents as VP',
        joins:[{
          table:"user_assigned_vendors as UV",
          type:"left",
          conditions:["UV.vendor_id = VP.vendor_id"]
        },{
          type:"left",
          table:"industries as I",
          conditions:["I.i_id = VP.industry"]
        },{
          type:"left",
          table:"sub_industries as S",
          conditions:["S.s_id = VP.sub_industry"]
        }
      ],
        conditions:[{'UV.user_id':this.loggedUserInfo.user_id}],
        order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
        grooupBy:'UV.vendor_id'
      }).then((res:any)=>{
        this.myVendors = res.data
        this.myVendorsTemp = res.data
        this.popoverIndex = ''
        resolve(true)
        // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
        // console.log("last index==",this.lastIndex)
      }).catch((e)=>{
        this.showSpinner = false
        this.observables.showToastMessage({type:1,message:'Problem while showing Vendor Hub.'});
      })
    })
    

  }

  gotoOverview(item){
    this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['/app/vendor-overview'],{state: { vendor: item },relativeTo: this.route})
  }

  
  showVendorPopup(i){

    if(i.vendor_id == this.popoverIndex){
      this.popoverIndex = ''
    }else{
      this.popoverIndex = i.vendor_id
    }

}

addToList(item,index){
  if(confirm(`Are you sure you want to add "${item.company_name}" into your Vendor Hub?`)){
    this.api.send("findDb",{
      table:"user_assigned_vendors",
      conditions:[{vendor_id:item.vendor_id,user_id:this.loggedUserInfo.user_id}]
    }).then((res:any)=>{
      if(res.data.length > 0){
        this.observables.showToastMessage({type:1,message:"Selected vendor already exists, into your list."})
      }else{
        this.api.send("insertDb",{
          table:"user_assigned_vendors",
          data:{
            user_id:this.loggedUserInfo.user_id,
            vendor_id:item.vendor_id
          }
        }).then((res1:any)=>{
          if(res1.data.affectedRows){
            this.observables.showToastMessage({type:0,message:"Vendor Added!"})
            item.user_id = this.loggedUserInfo.user_id
            item.assign_vendor_id = item.vendor_id
            item.assign_id = res1.data.insertId
            this.myVendors.unshift(item)
            this.myVendorsTemp = this.myVendors
            this.vendors.splice(index, 1)
            this.vendorsTemp = this.vendors
          
            
          }else{
            this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
          }
        }).catch((err)=>{
          this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
        })
      }
    }).catch((err)=>{
      this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
    })
  }
}

follow(){
  
}
archive(){
  
}
share(){
  
}

}
