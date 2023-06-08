import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Location } from '@angular/common';
@Component({
  selector: 'app-manual-vendor',
  templateUrl: './manual-vendor.component.html',
  styleUrls: ['./manual-vendor.component.scss']
})
export class ManualVendorComponent implements OnInit,OnDestroy {
  industries:any = []
  vendorForm : FormGroup
  loggedUserInfo:any = null
  userInfoSubscriber:any
  vendors:any = []
  myVendors:any = []
  showSpinner:boolean = false
  options: any[] = [];
  selectedManualVendors:any = []
  selectedManualVendorsTemp:any = []
  industryWise:any = []
  filteredOptions: Observable<any[]> ;
  @ViewChild('trigger', { read: MatAutocompleteTrigger }) autoComplete: MatAutocompleteTrigger;
  constructor(private location:Location, private api:ApiService, private fb:FormBuilder, private observables:ObservablesService) { }
  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
  }
  ngOnInit(): void {
    this.loggedUserInfo = this.api.userInfo
    // console.log("logged user details===",this.loggedUserInfo)
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      if(this.loggedUserInfo){
        
        this.getVendors()
        
        this.getSelectedManualVendors()
        
       }
    })
    
    this.vendorForm = this.fb.group({
      vendor_name:[null, Validators.required],
      website:[null, Validators.required],
      industry:[null],
      extension:["+1"],
      contact:[null]
    })

    if(this.loggedUserInfo){
      this.getVendors()
      // this.getIndustries()
      this.getSelectedManualVendors()
    }

  
  }


  
  getVendors(){
    this.api.send("findDb",{
      fields:["VP.*"],
      table:'vendor_parents as VP',
      conditions:[{'VP.approval_status !':6}]
    }).then((res:any)=>{
      // console.log("res==",res.data)
      this.getMyVendors().then((result:any)=>{

        // console.log("myVendors==",this.myVendors)

        let cars1IDs = new Set(this.myVendors.map(({ assign_vendor_id }) => assign_vendor_id));

        // console.log("vendors in mas==",cars1IDs)
        this.vendors = res.data.filter(({ vendor_id }) => {
          return !cars1IDs.has(vendor_id)
        })

        // console.log("vendors in mas==",this.vendors)

        this.options = this.vendors

        this.filteredOptions = <any> this.vendorForm.get('vendor_name')?.valueChanges
        .pipe(
          startWith(''),
          map(value =>{
            const name = typeof value === 'string' ? value : value?.company_name;
            return name ? this._filter(name as string) : this.options.slice();
          })
        );
        
        this.showSpinner = false
      })
    }).catch((e)=>{
      this.showSpinner = false
      this.observables.showToastMessage({type:1,message:'Problem while showing Vendors.'});
    })
  }

  private _filter(value: any) {
    // console.log("v alue==",value)
 

    if(value || value.trim().length > 0){

      const filterValue = value.toLowerCase();
      return this.options.filter((option:any) => option.company_name.toLowerCase().includes(filterValue));
    }

  }

  onSelectionChanged(_event: any,Data:any) {
    // console.log(Data)
    if (_event.isUserInput) {

          this.vendorForm.patchValue({vendor_name:Data.company_name,website:Data.website_url})
        }

  }
  displayFn(vendor:any): any {
    return vendor && vendor.company_name  ? vendor.company_name :'';
  }
 close(){
    this.autoComplete.closePanel()
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
        conditions:[{'UV.user_id':this.loggedUserInfo.user_id, 'VP.approval_status':1}],
        order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
        grooupBy:'UV.vendor_id'
      }).then((res:any)=>{
        this.myVendors = res.data
        resolve(true)
        // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
        // console.log("last index==",this.lastIndex)
      }).catch((e)=>{
        this.showSpinner = false
        this.observables.showToastMessage({type:1,message:'Problem while showing Vendor Hub.'});
      })
    })
    

  } 
  

  getIndustries(){
    this.api.send("findDb",{
      table:'industries'
    }).then((res:any)=>{
      this.industries = res.data
    })
  }

  addVendor(value){
    if(confirm("Are you sure you would like to add this vendor?")){
      value.contact = value.contact?value.extension + value.contact:null
      this.api.send("findDb",{
        table:"vendor_parents",
        conditions:[{company_name:value.vendor_name},{website_url:value.website}]
      }).then((res:any)=>{
        if(res.data.length > 0){

          this.api.send("findDb",{
            table:"chair_vendors",
            conditions:[{vendor_parent_id:res.data[0].vendor_id, user_id:this.loggedUserInfo.user_id}]
          }).then((res1:any)=>{
            if(res1.data.length > 0){
              
              this.assignVendorToUser(res.data[0].vendor_id).then((resp:any)=>{
                if(resp.status){
                  this.observables.showToastMessage({type:0, message:resp.message});
                  this.reset()
                }
              })
            }else{
              this.api.send('insertDb',{
                table:'chair_vendors',
                data:{
                  vendor_parent_id:res.data[0].vendor_id,
                  company_name:value.vendor_name,
                  user_id:this.loggedUserInfo.user_id
                }
              }).then((resp:any)=>{
                if(resp.data.affectedRows){
                  this.assignVendorToUser(res.data[0].vendor_id).then((resp:any)=>{
                    if(resp){
                      this.observables.showToastMessage({type:0, message:"Great! This vendor has been added to your Vendor Hub! Keep 'em coming!"});
                      this.api.send("vendorNotify",{username:this.loggedUserInfo.first_name +" "+this.loggedUserInfo.last_name, company_name:value.vendor_name})
                      this.reset()
                    }else{
                      this.observables.showToastMessage({type:0, message:'Vendor has been added'});
                      this.api.send("vendorNotify",{username:this.loggedUserInfo.first_name +" "+this.loggedUserInfo.last_name, company_name:value.vendor_name})
                      this.reset()
                    }
                  })
                 
                }else{
                  this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding in Vendor chiar. Try Again!"});
                }
              }).catch((e)=>{
                this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding in Vendor chiar. Try Again!"});
              })
            }
          })
        }else{
          this.api.send("insertDb",{
            table:"vendor_parents",
            data:{
              company_name:value.vendor_name,
              website_url:value.website,
              industry:value.industry,
              contact_number:value.contact,
              vendor_created_by:this.loggedUserInfo.user_id,
              approval_status:6
            }
          }).then((res:any)=>{
            if(res.data.affectedRows){
              this.api.send('insertDb',{
                table:'chair_vendors',
                data:{
                  vendor_parent_id:res.data.insertId,
                  company_name:value.vendor_name,
                  user_id:this.loggedUserInfo.user_id
                }
              }).then((resp:any)=>{
                if(resp.data.affectedRows){
                  this.assignVendorToUser(res.data.insertId).then((resp:any)=>{
                    if(resp){
                      this.observables.showToastMessage({type:0, message:"Great! This vendor has been added to your Vendor Hub! Keep 'em coming!"});
                      this.api.send("vendorNotify",{username:this.loggedUserInfo.first_name +" "+this.loggedUserInfo.last_name, company_name:value.vendor_name})
                      this.reset()
                    }else{
                      this.observables.showToastMessage({type:0, message:'Vendor has been added'});
                      this.api.send("vendorNotify",{username:this.loggedUserInfo.first_name +" "+this.loggedUserInfo.last_name, company_name:value.vendor_name})
                      this.reset()
                    }
                  })
                  // this.observables.showToastMessage({type:0, message:"Vendor added into the lounge!"});
                  // this.api.send("vendorNotify",{username:this.loggedUserInfo.first_name +" "+this.loggedUserInfo.last_name, company_name:value.vendor_name})
                  // this.reset()
                }else{
                  this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding in Vendor chiar. Try Again!"});
                }
              }).catch((e)=>{
                this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding in Vendor chiar. Try Again!"});
              })
         
              
            }else{
              this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding Vendor. Try Again!"});
            }
  
  
          }).catch((e:any)=>{
            this.observables.showToastMessage({type:1, message:"Some problem Occured while Adding Vendor. Try Again!"});
          })
        }
      })
       

    }
  }

  
  assignVendorToUser(vendor_id,){
    return new Promise((resolve)=>{
      this.api.send("findDb",{
        table:"user_assigned_vendors",
        conditions:[{vendor_id:vendor_id,user_id:this.loggedUserInfo.user_id}]
      }).then((res:any)=>{
        if(res.data.length > 0){
          resolve({status:true,message:'Vendor already assigned.'})
          // this.observables.showToastMessage({type:1,message:"Selected vendor already assigned to ."})
        }else{
          this.api.send("insertDb",{
            table:"user_assigned_vendors",
            data:{
              user_id:this.loggedUserInfo.user_id,
              vendor_id:vendor_id
            }
          }).then((res1:any)=>{
            if(res1.data.affectedRows){
              resolve({status:true,message:'Vendor added.'})
            }else{
              resolve({status:false,message:"Something went wrong while assign vendor. Try again!"})
              this.observables.showToastMessage({type:1,message:"Something went wrong while assign vendor. Try again!"})
            }
          }).catch((err)=>{
            resolve({status:false,message:"Something went wrong while assign vendor. Try again!"})
            this.observables.showToastMessage({type:1,message:"Something went wrong while assign vendor. Try again!"})
          })
        }
      }).catch((err)=>{
        resolve({status:false,message:"Something went wrong while assign vendor. Try again!"})
        this.observables.showToastMessage({type:1,message:"Something went wrong while assign vendor. Try again!"})
      })
    })
  
}
  reset(){
    this.vendorForm.reset()
  }

  goBack(){
    this.location.back()
  }




   getSelectedManualVendors(){
    this.api.send("findDb",{
      table:'vendor_parents',
      fields:["company_name,vendor_id,industry"],
      conditions:[{
        manual_selected_status:1
      }],
    }).then((res:any)=>{
      

        // this.selectedManualVendors = res.data
        this.getMyVendors().then((result:any)=>{

          let cars1IDs = new Set(this.myVendors.map(({ assign_vendor_id }) => assign_vendor_id));
          this.selectedManualVendors = res.data.filter(({ vendor_id }) => {
            return !cars1IDs.has(vendor_id)
          })
          // console.log("selectedManualVendors==",this.selectedManualVendors)
          this.selectedManualVendorsTemp = this.selectedManualVendors
          // this.showSpinner = false
        })
    
    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:'Problem while  Manual Vendor List.'});
    })
   }

  sortByAZ(){
    
    this.selectedManualVendors= this.selectedManualVendors.sort((a, b) => (a.company_name > b.company_name) ? 1 : -1);
  }
  sortByZA(){
    
  
      this.selectedManualVendors= this.selectedManualVendors.sort((a, b) => (a.company_name > b.company_name) ? -1 : 1);
  
  }

   sortByTrending(){
    this.industryWise = []
   }
   sortByIndustry(){
     let industryGroup:any = this.groupBy(this.selectedManualVendors, 'industry')
    for (const key in industryGroup) {
     

      // if (key || key !== "null") {
      //   console.log(`${key}: ${population[key]}`);
      this.industryWise.push(industryGroup[key])
      // }
    }
    console.log("industryWise==",this.industryWise)
    // this.IndustryStatus = true
    // this.api.send("queryDb",{
    //   sql:'select industry vendor_parents where manual_selected_status = 1 and industry is not null group by industry',
    // }).then((res:any)=>{
    //   if(res.data.length > 0){
    //     for(let i=0;i<res.data.length;i++){
    //       this.api.send("findDb")
    //     }
    //   }
    // })
   }

    groupBy (xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  
 
  addToMyVendor(item:any,index:any){
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
              // this.getSelectedManualVendors()
              // item.user_id = this.loggedUserInfo.user_id
              // item.assign_vendor_id = item.vendor_id
              // item.assign_id = res1.data.insertId
              // this.myVendors.unshift(item)
              // this.myVendorsTemp = this.myVendors
              this.selectedManualVendors.splice(index, 1)
              this.selectedManualVendorsTemp = this.selectedManualVendors
              // this.observables.myVendorsRefreshStatus.next()
              
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

}
