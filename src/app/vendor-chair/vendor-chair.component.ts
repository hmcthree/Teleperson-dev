import { Component, OnInit, OnDestroy} from '@angular/core';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
import { DatePipe } from '@angular/common'
import { environment } from '../../environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vendor-chair',
  templateUrl: './vendor-chair.component.html',
  styleUrls: ['./vendor-chair.component.scss']
})
export class VendorChairComponent implements OnInit, OnDestroy {

  // private config: PlaidConfig

  host:any = environment.host
  userInfoSubscriber:any
  loggedUserInfo:any =null
  vendors:any = []
  vendorsTemp:any = []
  link_token:any = ''
  searchSubscriber:any
  showSpinner:boolean = false
  constructor( private router:Router, private route:ActivatedRoute, private datePipe:DatePipe, private observables:ObservablesService, private api:ApiService) {
  
   
    // this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
    //   // console.log("Searchig For==",searchTerm)
    //   if(searchTerm.length > 0 && this.vendors.length > 0){
    //     this.vendors = this.vendorsTemp.filter((item)=>{
    //       return (item.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  
    //     });
    //   }else{
    //     this.vendors = this.vendorsTemp
    //   }
      
    // })
  }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
    // this.searchSubscriber.unsubscribe()
  }

  ngAfterViewInit(){
    this.api.selectedPageStatus.next({title:'Vendor Chair',searchStatus:true,backStatus:true})
  }


  ngOnInit(): void {
    this.loggedUserInfo = this.api.userInfo
    // console.log("logged user details===",this.loggedUserInfo)
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      if(this.loggedUserInfo){
        this.getPlaidVendors()
       }
    })

    if(this.loggedUserInfo){
      this.getPlaidVendors()
     }
  }



      
  getPlaidVendors(){
    return new Promise((resolve)=>{
      this.showSpinner = true
      this.api.send("findDb",{
        fields:["false as checked, CV.*, VP.*"],
        table:'chair_vendors as CV',
        joins:[{
          table:'vendor_parents as VP',
          type:'left',
          conditions:["VP.vendor_id = CV.vendor_parent_id"]
        }],
        conditions:[{"CV.user_id":this.loggedUserInfo.user_id, 'VP.approval_status':1}]
      }).then((res:any)=>{
        if(res.data.length == 0){
          this.showSpinner = false
          this.observables.showToastMessage({type:1,message:'No data found.'});
          resolve(false)
          return
        }


        this.vendors = res.data
        this.showSpinner = false
        this.getVendorsAssigned().then((res1:any)=>{
          if(res1?.length > 0){
            this.vendors.map((item:any)=>res1.find((x:any)=>(x.vendor_id == item.vendor_id && x.user_id == this.loggedUserInfo.user_id)?item.checked = true:item.checked = false))
          }

          console.log("vendors==",this.vendors)
        }).catch((e)=>{
          this.observables.showToastMessage({type:1,message:'My Vendors list is not loading. Try agaian'});
        })
        // for(let i=0;i<this.vendors.length;i++){
      
        //   this.getAssignUser(this.vendors[i].vendor_id).then((linkRes:any)=>{
        //     if(linkRes.status){
        //       this.vendors[i].is_plaid_linked = linkRes.plaid_linked_status
        //     }
    
        //     if(i == this.vendors.length - 1){
        //       this.showSpinner = false
        //       this.vendorsTemp = this.vendors
        //     }
    
        //   })
          
        // }
        resolve(true)
      }).catch((e)=>{
        this.observables.showToastMessage({type:1,message:'Problem while showing Chair Vendors.'});
        resolve(false)
      })
    })
  }

  getVendorsAssigned(){
    return new Promise((resolve, reject)=>{
      this.api.send("findDb",{
        table:'user_assigned_vendors',
        conditions:[{user_id:this.loggedUserInfo.user_id}]
      }).then((res:any)=>{
        resolve(res.data)
      }).catch((e)=>{
        reject(e)
      })
    })
    
  }


  gotoOverview(item){
    this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['../vendor-overview'],{state: { vendor: item },relativeTo: this.route})
  }

  checkUserVendor(item){
    this.checkLinked(item.vendor_id).then((checkRes:any)=>{
      if(checkRes.status){
        
        this.api.send("updateDb",{
          table:"user_assigned_vendors",
          data:{
            is_plaid_linked:1,
            plaid_linked_date:this.datePipe.transform(new Date(), 'yyyy-MM-dd')
          },
          conditions:[{
            user_id:this.loggedUserInfo.user_id,
            vendor_id:item.vendor_id
          }]
        }).then((res:any)=>{
          if(res.data.affectedRows){
            this.observables.showToastMessage({type:0,message:"Vendor Linked and added into VendorHub!"})
          }else{
            this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
          }
        }).catch((e)=>{
          this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
        })
      }else if(checkRes.status == false && checkRes.hasOwnProperty('data')){
        this.api.send("insertDb",{
          table:"user_assigned_vendors",
          data:{
            user_id:this.loggedUserInfo.user_id,
            vendor_id:item.vendor_id,
            is_plaid_linked:1,
            plaid_linked_date:this.datePipe.transform(new Date(), 'yyyy-MM-dd')
          }
        }).then((res:any)=>{
          if(res.data.affectedRows){
            this.observables.showToastMessage({type:0,message:"Vendor Linked and added into VendorHub!"})
          }else{
            this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
          }
        }).catch((e)=>{
          this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
        })
      }else{
        this.observables.showToastMessage({type:1,message:"Vendor already exist in VendorHub!"})
      }
    })
  }

  toggleChange(event,item){
    // console.log("toggle changed event==",event)
    // console.log("item==",item)
    if(event.target.checked){
      this.checkLinked(item.vendor_id).then((res1:any)=>{
        if(res1.length == 0){
          this.api.send("insertDb",{
            table:"user_assigned_vendors",
            data:{
              user_id:this.loggedUserInfo.user_id,
              vendor_id:item.vendor_id,
              // is_plaid_linked:1,
              // plaid_linked_date:this.datePipe.transform(new Date(), 'yyyy-MM-dd')
            }
          }).then((res:any)=>{
            if(res.data.affectedRows){
              this.observables.showToastMessage({type:0,message:"Awesome! This vendor has been added to your Vendor Hub"})
            }else{
              this.observables.showToastMessage({type:1,message:"Something went wrong while add vendor. Try again!"})
            }
          }).catch((e)=>{
            this.observables.showToastMessage({type:1,message:"Something went wrong while add vendor. Try again!"})
          })
        }else{
          this.observables.showToastMessage({type:1,message:"Awesome! This vendor has been added to your Vendor Hub"})
        }
      })
    }else{
      this.checkLinked(item.vendor_id).then((res1:any)=>{
        if(res1.length > 0){
          this.api.send("deleteDb",{
            table:"user_assigned_vendors",
            conditions:[{
              user_id:this.loggedUserInfo.user_id,
              vendor_id:item.vendor_id
            }]
          }).then((res:any)=>{
            if(res.data.affectedRows){
              this.observables.showToastMessage({type:0,message:"No problem. This vendor has been removed from your Vendor Hub"})
            }else{
              this.observables.showToastMessage({type:1,message:"Something went wrong while remove vendor. Try again!"})
            }
          }).catch((e)=>{
            this.observables.showToastMessage({type:1,message:"Something went wrong while remove vendor. Try again!"})
          })
        }else{
          this.observables.showToastMessage({type:1,message:"No problem. This vendor has been removed from your Vendor Hub"})
        }
      })
    }
    
    //   if(item.hasOwnProperty('vendor_id')){
    //     this.checkUserVendor(item)
        
    //   }else{
    //     this.api.send("findDb",{
    //       table:"vendor_parents",
    //       conditions:[{company_name:item.name}]
    //     }).then((vendorRes:any)=>{
    //       if(vendorRes.data.length > 0){
    //         this.checkUserVendor(item)
           
    //       }else{
    //         this.api.send("insertDb",{
    //           table:"vendor_parents",
    //           data:{
    //             company_name:item.name,
    //             approval_status:1
    //           }
    //         }).then((res:any)=>{
    //           if(res.data.affectedRows){
    //             this.checkUserVendor(item)
               
                
    //           }else{
    //             this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
    //           }
    //         }).catch((e)=>{
    //           this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
    //         })
    //       }
    //     })
       
    //   }
      
    // }else{
    //   if(item.hasOwnProperty("vendor_id")){
    //     this.api.send("updateDb",{
    //       table:"user_assigned_vendors",
    //       data:{
    //         is_plaid_linked:0,
    //         plaid_linked_date:this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    //       },
    //       conditions:[{
    //         user_id:this.loggedUserInfo.user_id,
    //         vendor_id:item.vendor_id
    //       }]
    //     }).then((res:any)=>{
    //       if(res.data.affectedRows){
    //         this.observables.showToastMessage({type:0,message:"Vendor Link removed!"})
    //       }else{
    //         this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
    //       }
    //     }).catch((e)=>{
    //       this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
    //     })
    //   }else{
    //     this.observables.showToastMessage({type:1,message:"Problem while removing and fetching Vendor. Try again!"})
    //   }
      
    // }
  }

  checkLinked(vendor_id){
    return new Promise((resolve, reject)=>{
      this.api.send("findDb",{
        table:"user_assigned_vendors",
        conditions:[{
          user_id:this.loggedUserInfo.user_id,
          vendor_id:vendor_id
        }]
      }).then((res:any)=>{
        resolve(res.data)
      }).catch((e)=>{
        reject(e)
      })
    })
  }

  // getAssignUser(vendor_id){
  //   return new Promise((resolve)=>{
  //     this.api.send("findDb",{
  //       table:"user_assigned_vendors",
  //       conditions:[{vendor_id:vendor_id,user_id:this.loggedUserInfo.user_id}]
  //     }).then((res:any)=>{
  //       if(res.data.length > 0){
  //         resolve({status:true,plaid_linked_status:res.data[0].is_plaid_linked})
  //       }else{
  //         resolve({status:false})
  //       }
  //     }).catch((er)=>{
  //       resolve({status:false})
  //     })
  //   })
  // }

  checkLogo(item){
    // if(item.hasOwnProperty('logo')){
    //   return true
    // }else{
    //   return false
    // }
  }
 
}