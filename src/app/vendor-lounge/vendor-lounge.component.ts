import { Component, OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup,Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
import { DatePipe,Location } from '@angular/common'
import { environment } from '../../environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit } from "@angular/core";
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as widgetSdk from "@mxenabled/web-widget-sdk"
// import {
//   PlaidErrorMetadata,
//   PlaidErrorObject,
//   PlaidEventMetadata,
//   PlaidOnEventArgs,
//   PlaidOnExitArgs,
//   PlaidOnSuccessArgs,
//   PlaidSuccessMetadata,
//   PlaidConfig,
//   NgxPlaidLinkService,
//   PlaidLinkHandler
// } from "ngx-plaid-link";
@Component({
  selector: 'app-vendor-lounge',
  templateUrl: './vendor-lounge.component.html',
  styleUrls: ['./vendor-lounge.component.scss']
})
export class VendorLoungeComponent implements AfterViewInit {
  // private plaidLinkHandler: PlaidLinkHandler;

  // private config: PlaidConfig

  host:any = environment.host
  myVendors:any = []
  myVendorsTemp:any = []
  userInfoSubscriber:any
  loggedUserInfo:any =null
  vendors:any = []
  transactions:any = []
  transactionsTemp:any = []
  vendorsTemp:any = []
  selected:any = ''
  link_token:any = ''
  searchSubscriber:any
  showSpinner:boolean = false;
  accountSpinnerStatus:boolean = false
  merchants:any = []
  plaidTryCount:number = 0
  widget:any = null
  institutions:any = []
  accounts:any = []
  viewDetailsStatus:any = null
  selectedAccounts: any =[];
  constructor(private location:Location, public dialog: MatDialog, private router:Router, private route:ActivatedRoute, private datePipe:DatePipe, private observables:ObservablesService, private api:ApiService,private fb:FormBuilder) {
  
    this.api.selectedPageStatus.next({title:'Vendor Lounge',searchStatus:true,backStatus:true})
    this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
      // console.log("Searchig For==",searchTerm)
      if(searchTerm.length > 0 && this.transactions.length > 0){
        this.transactions = this.transactionsTemp.filter((item)=>{
          return (item.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
  
        });
      }else{
        this.transactions = this.transactionsTemp
      }
      
    })
  }

  goBack(){
    this.selected = ''
    this.location.back()
  }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
    this.searchSubscriber.unsubscribe()
  }

  ngAfterViewInit() {
    this.loggedUserInfo = this.api.userInfo
    
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      // console.log("logged user details===",this.loggedUserInfo)
      
    })
 
    console.log("logged user details===",this.loggedUserInfo)
  }

  // getPlaid(){
   
  //   this.generateToken().then((res)=>{

  //     this.plaidLinkService
  //     .createPlaid(
  //       <PlaidConfig>{
  //         apiVersion: "v2",
  //         env: environment.plaidEnv,
  //         selectAccount: false,
  //         token: this.link_token,
  //         webhook: "",
  //         product: ["auth"],
  //         countryCodes: ['US', 'CA', 'GB'],
  //         onSuccess: (token, metadata) => this.onSuccess(token, metadata),
  //         onExit: (error, metadata) => this.onExit(error, metadata),
  //         onEvent: (eventName, metadata) => this.onEvent(eventName, metadata)
  //       }
        
  //     )
  //     .then((handler: PlaidLinkHandler) => {
  //       this.plaidLinkHandler = handler;
  //       this.open();
  //     }).catch(e=>{
  //       console.log("palid error==",e)
  //     });
  //   })

    
  // }

  ngOnInit(): void {
  
  }


  //  getInfo(){
  //   this.api.plaid("info","post").then( async (response:any)=>{
  //     if(!response.ok){
  //       return { paymentInitiation: false };
  //     }

  //     const data = await response.json();
  //     const paymentInitiation: boolean = data.products.includes(
  //       "payment_initiation"
  //     );
    
  //     return { paymentInitiation };
  //   })
   
    
  // }

  //  generateToken() {
  //    return new Promise((resolve)=>{
         
  //       if(localStorage.getItem("link_token") === null){
  //         const path = "create_link_token";
      
  //         this.api.plaid(path,"post",{user_id:this.loggedUserInfo.user_id}).then(async (response:any)=>{
           
  //           localStorage.setItem("link_token", response.link_token); //to use later for Oauth
  //           this.link_token = response.link_token
  //           resolve(true)
  //         }).catch((e)=>{
  //           resolve(false)
  //         })
  //       }else{
  //         this.link_token = localStorage.getItem("link_token")
  //         resolve(true)
  //       }
      
  //    })
      
  //   }
     
      
  // getVendors(){
  //   return new Promise((resolve)=>{
  //     this.api.send("findDb",{
  //       table:'vendor_parents as VP',
  //       conditions:[{'VP.approval_status':1}]
  //     }).then((res:any)=>{
        
  //       this.vendors = res.data
  //       resolve(true)
  //     }).catch((e)=>{
  //       this.observables.showToastMessage({type:1,message:'Problem while showing Vendors.'});
  //       resolve(false)
  //     })
  //   })
  // }


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

  closeMx(){
    this.showSpinner = true
    this.merchants = []
    let tempMerchants:any = []
    this.api.mxApi("user-transaction-marchants",{user_id:this.loggedUserInfo.user_id,user_mx_id:this.loggedUserInfo.mx_user_id}).then(async (res:any)=>{
      console.log("marchants==",res)
      this.widget.unmount()

      const ids = res.map(o => o.merchant.guid)
        await res.map(({merchant}, index) => {
          if(!ids.includes(merchant.guid, index + 1)){
              merchant.checked = false
              this.merchants.push(merchant)
          }   
        })


       await  this.getVendorsAssigned().then(async (res1:any)=>{
          if(res1?.length > 0){
           await this.merchants.map((item:any)=>res1.find((x:any)=>(x.vendor_id == item.vendor_id && x.user_id == this.loggedUserInfo.user_id)?item.checked = true:item.checked = false))
          
          
          }

        }).catch((e)=>{
          this.observables.showToastMessage({type:1,message:'My Vendors list is not loading. Try agaian'});
        })


      // res.map((item:any)=>{
      //   item.merchant.checked = false
      //   tempMerchants.push(item.merchant)
      // })

      this.showSpinner = false
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

  

  
  toggleChange(event,item){
    // console.log("toggle changed event==",event)
    // console.log("item==",item)
    if(event.target.checked){
      if(item.vendor_id){
        
        this.checkLinked(item.vendor_id).then((res1:any)=>{
          if(res1.length == 0){
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
                this.observables.showToastMessage({type:0,message:"Vendor Linked and added into my vendorHub!"})
              }else{
                this.observables.showToastMessage({type:1,message:"Something went wrong while linking vendor. Try again!"})
              }
            }).catch((e)=>{
              this.observables.showToastMessage({type:1,message:"Something went wrong while linking vendor. Try again!"})
            })
          }else{
            this.observables.showToastMessage({type:1,message:"Vendor is already existes into my vendors!"})
          }
        })
      }else{
        this.observables.showToastMessage({type:1,message:"Vendor not found. Try again!"})
      }
    }
  }

  onGroupsChange(event: any) {
    console.log("selected ",event);
  }

  saveAccounts(){

  }


  // toggleChange(event,item){
  //   console.log("toggle changed event==")
  //   // console.log("item==",item)
  //   if(event.checked){
  //     if(item.hasOwnProperty('vendor_id')){
  //       this.checkUserVendor(item)
        
  //     }else{
  //       this.api.send("findDb",{
  //         table:"vendor_parents",
  //         conditions:[{company_name:item.name}]
  //       }).then((vendorRes:any)=>{
  //         if(vendorRes.data.length > 0){
  //           this.checkUserVendor(item)
           
  //         }else{
  //           this.api.send("insertDb",{
  //             table:"vendor_parents",
  //             data:{
  //               company_name:item.name,
  //               approval_status:1
  //             }
  //           }).then((res:any)=>{
  //             if(res.data.affectedRows){
  //               this.checkUserVendor(item)
               
                
  //             }else{
  //               this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
  //             }
  //           }).catch((e)=>{
  //             this.observables.showToastMessage({type:1,message:"Something went wrong while adding vendor. Try again!"})
  //           })
  //         }
  //       })
       
  //     }
      
  //   }else{
  //     if(item.hasOwnProperty("vendor_id")){
  //       this.api.send("updateDb",{
  //         table:"user_assigned_vendors",
  //         data:{
  //           is_plaid_linked:0,
  //           plaid_linked_date:this.datePipe.transform(new Date(), 'yyyy-MM-dd')
  //         },
  //         conditions:[{
  //           user_id:this.loggedUserInfo.user_id,
  //           vendor_id:item.vendor_id
  //         }]
  //       }).then((res:any)=>{
  //         if(res.data.affectedRows){
  //           this.observables.showToastMessage({type:0,message:"Vendor Link removed!"})
  //         }else{
  //           this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
  //         }
  //       }).catch((e)=>{
  //         this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
  //       })
  //     }else{
  //       this.observables.showToastMessage({type:1,message:"Problem while removing and fetching Vendor. Try again!"})
  //     }
      
  //   }
  // }

  // checkLinked(vendor_id){
  //   return new Promise((resolve)=>{
  //     this.api.send("findDb",{
  //       table:"user_assigned_vendors",
  //       conditions:[{
  //         user_id:this.loggedUserInfo.user_id,
  //         vendor_id:vendor_id
  //       }]
  //     }).then((res:any)=>{
  //       if(res.data.length > 0){
  //         resolve({status:true,data:res.data})
  //       }else{
  //         resolve({status:false,data:res.data})
  //       }
  //     }).catch((e)=>{
  //       resolve({status:false})
  //     })
  //   })
  // }

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


  // open() {
  //   this.plaidLinkHandler.open();
  // }

  // exit() {
  //   this.plaidLinkHandler.exit();
  // }

  
  // onSuccess(token, metadata) {
  //   // console.log("We got a token:", token);
  //   this.showSpinner = true
  //   this.api.plaid('set_access_token',"post",{public_token:token,user_id:this.loggedUserInfo.user_id}).then(async (response:any)=>{
  //     this.api.plaid('transactions',"get").then((res:any)=>{
         
  //         this.getVendors().then((result:any)=>{
  //           const localVendorNames = new Set(this.vendors.map(d => d.company_name.trim().toUpperCase()));
  //           const plaidNames:any = [...new Set(res.transactions.map(d => d.name.trim().toUpperCase()))];
  //           let availableVendors:any = []
  //           let availableVendorsClone:any = []
  //           let otherVendors:any = []
  //           let otherVendorsObject:any = []
  //           let otherVendorsClone:any = []
  //           // console.log(plaidNames)
  //           for(let i=0;i<plaidNames.length;i++){
  //             if(plaidNames[i].includes("DES:")){
  //               plaidNames[i] = plaidNames[i].split("DES:")[0].trim().toUpperCase()
  //               if(localVendorNames.has(plaidNames[i])){
  //                 if(!availableVendorsClone.includes(plaidNames[i])){
  //                   let foundLocalVendor:any = this.vendors.find((item)=>item.company_name.trim().toUpperCase() == plaidNames[i])
  //                   let foundPlaidVendor:any = res.transactions.find((item)=>item.name.split("DES:")[0].trim().toUpperCase() == plaidNames[i])
  //                   foundPlaidVendor.name = foundPlaidVendor.name.split("DES:")[0].trim().toUpperCase()
  //                   availableVendorsClone.push(foundPlaidVendor.name.split("DES:")[0].trim().toUpperCase())
  //                   foundPlaidVendor.logo = foundLocalVendor.logo
  //                   foundPlaidVendor.vendor_id = foundLocalVendor.vendor_id
  //                   foundPlaidVendor.verified_status = foundLocalVendor.verified_status
                    
  //                   this.getAssignUser(foundLocalVendor.vendor_id).then((linkRes:any)=>{
  //                     if(linkRes.status){
  //                       foundPlaidVendor.is_plaid_linked = linkRes.plaid_linked_status
  //                     }

  //                     availableVendors.push(foundPlaidVendor)
  //                   })
  //                 }
                  
                  
  //               }else{
                    
  //                   if(!otherVendorsClone.includes(plaidNames[i])){

  //                     otherVendorsClone.push(plaidNames[i])
  //                     otherVendors.push(`("${plaidNames[i]}", 1)`)
  //                     let foundPlaidVendor:any = res.transactions.find((item)=>item.name.split("DES:")[0].trim().toUpperCase() == plaidNames[i])
  //                     foundPlaidVendor.name = foundPlaidVendor.name.split("DES:")[0].trim().toUpperCase()
  //                     foundPlaidVendor.is_plaid_linked = 0
  //                     foundPlaidVendor.verified_status = 0
  //                     otherVendorsObject.push(foundPlaidVendor)     
  //                   }
                    
                
  //               }
  //             }

              

              

  //             if(i == plaidNames.length - 1){
  //               // console.log("other venddors===",otherVendors)
  //               // console.log("availableVendors===",availableVendors)
  //               this.transactions = availableVendors
  //               this.transactionsTemp = this.transactions
               
  //               if(otherVendors.length > 0){
                  
  //                 this.api.send("queryDb",{
  //                   sql:`Insert Into vendor_parents (company_name, approval_status) values ${otherVendors.join(",")}`
  //                 }).then((insertRes:any)=>{
  //                   // console.log("Iserted Res==",insertRes.data)
  //                   if(insertRes.data.affectedRows){
  //                     this.transactions = [...this.transactions, ...otherVendorsObject]
  //                     this.transactionsTemp = this.transactions
  //                     this.api.send("newvendorList",{vendors:otherVendorsClone})
  //                     this.saveChairVendors().then((res:any)=>{
  //                       this.showSpinner = false
  //                     }).catch((e)=>{
  //                       this.showSpinner = false
  //                       this.observables.showToastMessage({type:1,message:'Problem while saving chair vendors.'});
  //                     })
  //                   }else{
  //                     this.observables.showToastMessage({type:1,message:'Problem while showing new vendors.'});
  //                   }
                  
  //                 }).catch((e)=>{
  //                   console.log("ee==",e)
  //                   this.showSpinner = false
  //                   this.observables.showToastMessage({type:1,message:'Problem while showing new vendors.'});
  //                 })
  //                 // this.api.send("newvendorList",{vendors:otherVendors})
  //               }else{
  //                 this.saveChairVendors().then((res:any)=>{
  //                   this.showSpinner = false
  //                 }).catch((e)=>{
  //                   this.showSpinner = false
  //                   this.observables.showToastMessage({type:1,message:'Problem while saving chair vendors.'});
  //                 })
                  
  //               }

                
                
               
  //               this.api.selectedPageStatus.next({title:'Vendor Lounge',searchStatus:true})


  //               // console.log("availableVendors==",availableVendors)
  //               // console.log("otherVendors==",otherVendors)
  //             }
  //         }          
  //       })
  //     }).catch((err)=>{
  //       this.observables.showToastMessage({type:1,message:'Problem while showing vendors.'});
  //       this.selected = ''
  //       this.showSpinner = false
  //     })
  //   }).catch((err)=>{
  //     this.observables.showToastMessage({type:1,message:'Problem while showing vendors.'});
  //     this.selected = ''
  //     this.showSpinner = false
  //   })
  //   // console.log("We got metadata:", metadata);
  // }

  // saveChairVendors(){
  //   return new Promise((resolve,reject)=>{
  //     this.api.send("findDb",{
  //       table:'chair_vendors',
  //       conditions:[{user_id:this.loggedUserInfo.user_id}]
  //     }).then((res:any)=>{
  //       if(res.data.length > 0){
  //         let localVendorNames = new Set(res.data.map(d => d.company_name.trim().toUpperCase()));
  //         let plaidNames:any = this.transactions.map(d => d.name.trim().toUpperCase());
  //         let failstatus = false
  //         console.log("localVendorNames==",localVendorNames)
  //         console.log("plaidNames==",plaidNames)
  //         for(let i=0;i<plaidNames.length;i++){
  //           console.log("plaidNames[i]==",plaidNames[i])
  //           if(localVendorNames.has(plaidNames[i])){
  //             if(i == plaidNames.length - 1){
  //               if(failstatus){
  //                 reject(false)
  //               }else{
  //                 resolve(true)
  //               }
                
  //             }
  //           }else{
  //             this.api.send('insertDb',{
  //               table:'chair_vendors',
  //               data:{
  //                 company_name:plaidNames[i],
  //                 user_id:this.loggedUserInfo.user_id
  //               }
  //             }).then((resp:any)=>{
  //               console.log("inserted new==",plaidNames[i])
  //               if(i == plaidNames.length - 1){
  //                 if(failstatus){
  //                   reject(false)
  //                 }else{

  //                   resolve(true)
  //                 }
  //               }
  //             }).catch((err)=>{
  //               failstatus = true
  //               if(i == plaidNames.length - 1){
  //                 resolve(false)
  //               }
  //             })
  //           }

  //         }
  //       }else{
  //         let plaidNames:any = this.transactions.map(d => d.name.trim().toUpperCase());
  //         let failstatus = false
  //         for(let i=0;i<plaidNames.length;i++){
  //           this.api.send('insertDb',{
  //             table:'chair_vendors',
  //             data:{
  //               company_name:plaidNames[i],
  //               user_id:this.loggedUserInfo.user_id
  //             }
  //           }).then((resp:any)=>{
  //             console.log("inserted new==",plaidNames[i])
  //             if(i == plaidNames.length - 1){
  //               if(failstatus){
  //                 reject(false)
  //               }else{

  //                 resolve(true)
  //               }
  //             }
  //           }).catch((err)=>{
  //             failstatus = true
  //             if(i == plaidNames.length - 1){
  //               reject(false)
  //             }
  //           })
  //         }
  //       }
        
  //     }).catch((e)=>{
  //       reject(false)
  //     })
     
  //   })
  
  // }




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
    if(item.hasOwnProperty('logo')){
      return true
    }else{
      return false
    }
  }

  // onEvent(eventName, metadata) {
  //   console.log("We got an event:", eventName);
  //   console.log("We got metadata:", metadata);
  //   if(metadata.error_code == "INVALID_LINK_TOKEN"){
  //     this.plaidTryCount = this.plaidTryCount + 1
  //     if(this.plaidTryCount <= 5){

  //       localStorage.removeItem("link_token")
  
  //       this.getPlaid()
  //     }else{
  //       this.observables.showToastMessage({type:1,message:'Oops! Something went wrong try after some time.'});
  //     }
  //   }
  // }

  // onExit(error, metadata) {
  //   console.log("We exited:", error);
  //   console.log("We got metadata:", metadata);
  //   this.selected = ''
  // }

  selectMode(mode){
    this.selected = mode
    
    if(mode == 'auto'){
      if(this.loggedUserInfo){

        if(this.loggedUserInfo.mx_user_id){

          this.getMx(this.loggedUserInfo.mx_user_id)
      
        }else{
          this.api.createMXUser({
              "email": this.loggedUserInfo.email,
              "id": this.loggedUserInfo.user_id ,
              "is_disabled": false,
              "first_name":this.loggedUserInfo.first_name,
              "last_name":this.loggedUserInfo.last_name
          }).then((res:any)=>{
            console.log("user result==",res)
            this.loggedUserInfo.mx_user_id =  res.user.guid
            this.api.send("updateDb",{
              table:'users',
              data:{
                mx_user_id:res.user.guid
              },
              conditions:[{user_id:this.loggedUserInfo.user_id}]
            }).then((result:any)=>{
              if(result.data.affectedRows){
                this.getMx(this.loggedUserInfo.mx_user_id)
              }else{
                this.observables.showToastMessage({type:1,message:'MX user created, But record not updated!'})
              }
            }).catch((e:any)=>{
              this.observables.showToastMessage({type:1,message:'MX user created, But record not updated!'})
            })
          }).catch((e:any)=>{
            this.observables.showToastMessage({type:1,message:'Problem while creating user in MX!, Try again'})
          })
        }
          // this.getPlaid()
          
      }else{
        console.log('Login Again')
      }

      
      
    }else{
      if(this.loggedUserInfo){
        this.router.navigate(['app/manual'])
      }else{
        console.log('Login Again')
      }
      // this.observables.showToastMessage({type:1,message:'Manual Data Not Found.'});
    }
  }

  closeSettings(){
    this.institutions = []
  }

  showDetails(item){
    this.accountSpinnerStatus = true
    this.viewDetailsStatus = item
    this.api.mxApi("get-institution-accounts",{user_id:this.loggedUserInfo.user_id,user_mx_id:this.loggedUserInfo?.mx_user_id,managed_by_user_status:true}).then((res:any)=>{
      console.log("get-institution-accounts==",res)
      this.accounts = res.data
      this.accountSpinnerStatus = false
    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:'Problem while showing Institutions.'});
      this.accountSpinnerStatus = false
    })
  }

  closeDetails(){
    this.viewDetailsStatus = null
  }
  getLocalInstitutes(mx_user_id = this.loggedUserInfo?.mx_user_id){
    this.api.send("findDb",{
      table:'institutions',
      conditions:[{user_guid:mx_user_id}]
    }).then((res:any)=>{
      this.institutions = res.data
    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:'Problem while showing Institutions.'});
    })
  }

  getMx(mx_user_id){
    this.api.mx({api: `users/${mx_user_id}/widget_urls`,
    action:'widget_url'
  }).then((res:any)=>{
        // console.log("res===",res)
        this.widget = new widgetSdk.ConnectWidget({
          container: "#container",
          url: res.widget_url.url,
        //   // additional widget options
          onLoaded: (payload) => {
            console.log("onLoaded==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Initial step: ${payload.initial_step}`)
            this.updateFavouriteInstitutions()
          },
          onEnterCredentials: (payload) => {
            console.log("onEnterCredentials==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Institution: ${payload.institution}`)
          },
          onInstitutionSearch: (payload) => {
            console.log("onInstitutionSearch==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Query: ${payload.query}`)
          },
          onSelectedInstitution: (payload) => {
            console.log("onSelectedInstitution==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Code: ${payload.code}`)
            console.log(`Guid: ${payload.guid}`)
            console.log(`Name: ${payload.name}`)
            console.log(`Url: ${payload.url}`)
          },
          onMemberConnected: (payload) => {
            console.log("onMemberConnected==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
          },
          onConnectedPrimaryAction: (payload) => {
            console.log("onConnectedPrimaryAction==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
          },
          onMemberDeleted: (payload) => {
            console.log("onMemberDeleted==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
          },
          onCreateMemberError: (payload) => {
            console.log("onCreateMemberError==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Institution guid: ${payload.institution_guid}`)
            console.log(`Institution code: ${payload.institution_code}`)
          },
          onMemberStatusUpdate: (payload) => {
            console.log("onMemberStatusUpdate==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
            console.log(`Connection status: ${payload.connection_status}`)
          },
          onOAuthError: (payload) => {
            console.log("onOAuthError==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
          },
          onOAuthRequested: (payload) => {
            console.log("onOAuthRequested==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Url: ${payload.url}`)
            console.log(`Member guid: ${payload.member_guid}`)
          },
          onStepChange: (payload) => {
            console.log("onStepChange==",payload)
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Previous: ${payload.previous}`)
            console.log(`Current: ${payload.current}`)
            // widget.unmount()
            if(payload.current == 'connected'){

          
              // this.api.mx({action:'merchants'}).then((result:any)=>{
              //   console.log("transactmerchantsionsRes===",result)
              //   this.merchants = result.merchants
              //   widget.unmount()
              // })
              
            }
          },
          onSubmitMFA: (payload) => {
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
          },
          onUpdateCredentials: (payload) => {
            console.log(`User guid: ${payload.user_guid}`)
            console.log(`Session guid: ${payload.session_guid}`)
            console.log(`Member guid: ${payload.member_guid}`)
            console.log(`Institution: ${payload.institution}`)
          }
        })
      })
  }

  updateFavouriteInstitutions(){
    this.api.mxApi("update-favorite-institutions",{user_id:this.loggedUserInfo.user_id,user_mx_id:this.loggedUserInfo?.mx_user_id}).then((res:any)=>{
      console.log("favorite-institutions==",res)
     
    })
  }
}

@Component({
  selector: 'dialog',
  templateUrl: './dialog.html',
  styleUrls: ['./vendor-lounge.component.scss']
})
export class DialogView {
  constructor(
    public dialogRef: MatDialogRef<DialogView>
  ) {}
  
  selectMode(mode){
    if(mode == 'auto'){
      this.dialogRef.close(mode);
      
    }
  }

}
