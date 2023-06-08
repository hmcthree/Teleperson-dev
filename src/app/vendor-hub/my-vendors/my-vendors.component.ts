import { Component, OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { ApiService } from '../../api.service';
import { ObservablesService } from '../../observables.service';
import { DatePipe } from '@angular/common'
import { environment } from '../../../environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-my-vendors',
  templateUrl: './my-vendors.component.html',
  styleUrls: ['./my-vendors.component.scss']
})
export class MyVendorsComponent implements OnInit {
  host:any = environment.host
  myVendors:any = []
  myVendorsTemp:any = []
  userInfoSubscriber:any
  loggedUserInfo:any =null
  popoverIndex:any=''
  searchSubscriber:any
  sortSubscriber:any
  refreshSubscriber:any
  constructor(private ele:ElementRef, private route:ActivatedRoute, private router:Router, private datePipe:DatePipe, private observables:ObservablesService, private api:ApiService,private fb:FormBuilder) {

  }

  ngOnDestroy(){
    console.log("calling uns")
    this.userInfoSubscriber.unsubscribe()
    this.searchSubscriber.unsubscribe()
    this.sortSubscriber.unsubscribe()
    this.refreshSubscriber.unsubscribe()
  }

  ngOnInit(): void {
    console.log("Hello My Vendors")
    this.loggedUserInfo = this.api.userInfo
    this.api.selectedPageStatus.next({title:'My Vendor',searchStatus:true,backStatus:true})
    this.refreshSubscriber = this.observables.myVendorsRefreshStatus.subscribe((res:any)=>{
      this.getMyVendors()
    })
    this.sortSubscriber = this.api.sortStatus.subscribe((res:any)=>{
      if(res.sortBy == "asc"){ 
          this.myVendors= this.myVendors.sort((a, b) => (a.company_name > b.company_name) ? 1 : -1);
      }else{
        this.myVendors= this.myVendors.sort((a, b) => (a.company_name > b.company_name) ? -1 : 1);
      }
       
    })
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      // if(this.loggedUserInfo){
        // console.log("loggedUserInfo=1",this.loggedUserInfo)
        // this.getPermissions()
        if(this.loggedUserInfo){
        //  this.getVendors()
         this.getMyVendors()
        }
      // }
    })

    this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
      // console.log("Searchig For==",searchTerm)
      if(searchTerm.length > 0){
        this.myVendors = this.myVendorsTemp.filter((item)=>{
          return (item.company_name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  
        });
      }else{
        this.myVendors = this.myVendorsTemp
      }
      
    })
 
    if(this.loggedUserInfo){
    //  this.getVendors()
     this.getMyVendors()
    }
  }

  checkLogo(item){
    if(item.logo){
      return true
    }else{
      return false
    }
  }


  getMyVendors(){
    return new Promise((resolve)=>{
      this.api.send("findDb",{
        fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id"],
        table:'vendor_parents as VP',
        joins:[{
          table:"user_assigned_vendors as UV",
          type:"left",
          conditions:["UV.vendor_id = VP.vendor_id"]
        }
      ],
        conditions:[{'UV.user_id':this.loggedUserInfo.user_id, "VP.approval_status":1}],
        order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
        grooupBy:'UV.vendor_id'
      }).then((res:any)=>{
        this.myVendors = res.data
        this.myVendorsTemp = res.data
        resolve(true)
        // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
        // console.log("last index==",this.lastIndex)
      }).catch((e)=>{
        this.observables.showToastMessage({type:1,message:'Problem while showing Vendor Hub.'});
      })
    })
    

  }

  gotoOverview(item){
    // this.api.selectedPageStatus.next({title:"Company Overview"})
    // this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['/app/vendor-overview'],{state: { vendor: item },relativeTo: this.route})
    // this.router.navigate(['../vendor-overview'],{state: { vendor: item },relativeTo: this.route})
    
  }


  showVendorPopup(i){

      if(i.vendor_id == this.popoverIndex){
        this.popoverIndex = ''
      }else{
        this.popoverIndex = i.vendor_id
      }
 
  }

  removeFromList(item,index){
    if(confirm(`Are you sure you want to remove "${item.company_name}" from your Vendor Hub?`)){
      this.api.send("deleteDb",{
        table:"user_assigned_vendors",
        conditions:[{user_id:this.loggedUserInfo.user_id, vendor_id:item.vendor_id}]
      }).then((res:any)=>{
        if(res.data.affectedRows){
           this.observables.showToastMessage({type:0,message:"Vendor Removed!"})
          item.user_id = null
          item.assign_vendor_id = null
          item.assign_id = null
          this.myVendors.splice(index, 1)
          this.myVendorsTemp = this.myVendors
          this.popoverIndex = ''
          // if(this.vendorSearchTerm.length > 0){
          //   this.arraymove(this.vendors,index,this.vendors.length-1)
            
          // }else{
          //   this.arraymove(this.vendors,index,this.vendors.length-1)
          //   this.vendorsTemp = this.vendors
          // }
          
        }else{
          this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
        }
      }).catch((err)=>{
        this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
      })
    }
  }


}
