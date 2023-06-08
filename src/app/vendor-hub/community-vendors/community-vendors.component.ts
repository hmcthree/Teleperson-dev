import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/api.service';
import { ObservablesService } from 'src/app/observables.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-community-vendors',
  templateUrl: './community-vendors.component.html',
  styleUrls: ['./community-vendors.component.scss']
})
export class CommunityVendorsComponent implements OnInit {
  host:any = environment.host
  vendors:any = []
  vendorsTemp:any = []
  myVendors:any = []
  myVendorsTemp:any = []
  searchSubscriber:any
  loggedUserInfo:any =null
  sortSubscriber:any
  userInfoSubscriber:any
  popoverIndex:any = ''
  showSpinner:boolean = true
  constructor(private router:Router,private route:ActivatedRoute, private api:ApiService, private observables:ObservablesService) { }

  ngOnDestroy(){
    this.searchSubscriber.unsubscribe()
    this.sortSubscriber.unsubscribe()
    this.userInfoSubscriber.unsubscribe()
  }
  ngOnInit(): void {
    this.loggedUserInfo = this.api.userInfo
    this.api.selectedPageStatus.next({title:'Community Vendor',searchStatus:true,backStatus:true})
    this.sortSubscriber = this.api.sortStatus.subscribe((res:any)=>{
      if(res.sortBy == "asc"){ 
          this.vendors= this.vendors.sort((a, b) => (a.company_name > b.company_name) ? 1 : -1);
      }else{
        this.vendors= this.vendors.sort((a, b) => (a.company_name > b.company_name) ? -1 : 1);
      }
       
    })
    this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
      // console.log("Searchig For==",searchTerm)
      if(searchTerm.length > 0){
        this.vendors = this.vendorsTemp.filter((item)=>{
          return (item.company_name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  
        });
      }else{
        this.vendors = this.vendorsTemp
      }
      
    })

    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
        if(this.loggedUserInfo){
          this.getMyVendors().then((res:any)=>{
            if(this.myVendors.length > 0){
    
              this.getVendors()
            }
          })
        }
    })

    if(this.loggedUserInfo){
      //  this.getVendors()
      this.getMyVendors().then((res:any)=>{
        if(this.myVendors.length > 0){

          this.getVendors()
        }
      })
    }
  }



  getVendors(){
    this.api.send("queryDb",{
      sql:`SELECT ANY_VALUE(company_name) as company_name,ANY_VALUE(company_overview) as company_overview, ANY_VALUE(industry) as industry, ANY_VALUE(logo) as logo, ANY_VALUE(founded) as founded,  ANY_VALUE(logo_url) as logo_url, ANY_VALUE(employees) as employees, ANY_VALUE(V.vendor_id) as vendor_id,ANY_VALUE(user_id) as user_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id ) where V.vendor_id IS NOT NULL and user_id != ${this.loggedUserInfo.user_id} group by UV.vendor_id`
      // sql:`SELECT ANY_VALUE(V.company_name) as company_name, ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL GROUP BY UV.vendor_id HAVING COUNT(*) > 1`
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
    })
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

  checkLogo(item){
    if(item.logo){
      return true
    }else{
      return false
    }
  }

  
//   showVendorPopup(i){

//     if(i.vendor_id == this.popoverIndex){
//       this.popoverIndex = ''
//     }else{
//       this.popoverIndex = i.vendor_id
//     }

// }


  
addToList(item,index){
  if(confirm(`Are you sure you want to add "${item.company_name}" into my vendor?`)){
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
            this.observables.myVendorsRefreshStatus.next()
            
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
