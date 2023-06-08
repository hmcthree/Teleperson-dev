
  import { Component, OnInit,OnDestroy,ViewChild, ElementRef } from '@angular/core';
  import { FormBuilder, FormGroup,Validators } from '@angular/forms';
  import { ApiService } from '../api.service';
  import { ObservablesService } from '../observables.service';
  import { DatePipe } from '@angular/common'
  import { environment } from '../../environments/environment.prod';
@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent implements OnInit {
  host:any = environment.host
  vendors:any = []
  vendorsTemp:any = []
  myVendors:any = []
  myVendorsTemp:any = []
  vendorSearchTerm:string = ''
  myVendorSearchTerm:string = ''
  intentionSearchTerm:string = ''
  vendorForm:FormGroup
  userInfoSubscriber:any
  loggedUserInfo:any =null
  selectedVendorData:any = null
  showSpinner:boolean = true
  childs:any = []
  childsTemp:any = []
  lastIndex:any = 0
  constructor(private datePipe:DatePipe, private observables:ObservablesService, private api:ApiService,private fb:FormBuilder) {

 }

 ngOnDestroy(){
   this.userInfoSubscriber.unsubscribe()
 }

  ngOnInit(): void {

    this.loggedUserInfo = this.api.userInfo

   this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
     this.loggedUserInfo = res
     if(this.loggedUserInfo){
       console.log("loggedUserInfo=1",this.loggedUserInfo)
       // this.getPermissions()
       if(this.loggedUserInfo){
        this.getVendors()
        this.getMyVendors()
       }
     }
   })

   if(this.loggedUserInfo){
    this.getVendors()
    this.getMyVendors()
   }

    this.vendorForm = this.fb.group({
      company_name:[null,Validators.compose([Validators.required])],
      parent_company:[null],
      address_1:[null],
      address_2:[null],
      city:[null],
      state:[null],
      zip:[null],
      country:[null],
      contact_number:[null,Validators.compose([Validators.required])],
      industry:[null],
      sub_industry:[null],
      ticker:[null],
      stock_price:[null],
      website_url:[null],
      business_cid:[null],
      linkedin:[null],
      company_overview:[null],
      number_of_locations:[null],
      subsidiaries:[null],
      customer_reviews:[null],
      category:[null],
      community_reviews:[null],
      support_email:[null],
      customer_service_number:[null],
      founded:[null],
      competitors:[null],
      revenue:[null],
      employees:[null]
    });

    
  }

  getVendors(){
    // this.api.send("findDb",{
    //   fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id"],
    //   table:'vendor_parents as VP',
    //   joins:[{
    //     table:"user_assigned_vendors as UV",
    //     type:"left",
    //     conditions:["UV.vendor_id = VP.vendor_id"]
    //   }],
    //   order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
    //   groupBy:'UV.vendor_id'
    // }).then((res:any)=>{
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
      
      // this.vendors = res.data
      // this.vendorsTemp = res.data
      this.getMyVendors().then((result:any)=>{
        // for(let i=0;i<res.data.length;i++){
        //   this.vendors = res.data.filter(item=>this.myVendors)
        // }

        let cars1IDs = new Set(this.myVendors.map(({ assign_vendor_id }) => assign_vendor_id));
        // console.log("cars1IDs==",cars1IDs)
        // console.log("my vendors==",this.myVendors)
        // let common:any =[]
        this.vendors = res.data.filter(({ vendor_id }) => {
          // console.log("assign_vendor_id==",vendor_id)
          // console.log("has==",res.data.has(vendor_id))
          return !cars1IDs.has(vendor_id)
        })
        // console.log("common==",common)
        // this.vendors = [
        //   ...res.data,
        //   ...this.myVendors.filter(({ assign_vendor_id }) => !cars1IDs.has(assign_vendor_id))
        // ];

        console.log("vendors==",this.vendors)
        this.vendorsTemp = this.vendors
        
      })
      // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
      // console.log("last index==",this.lastIndex)
    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:'Problem while showing Vendors.'});
    })

    // this.api.send("findDb",{
    //   fields:["VP.*"],
    //   table:'vendor_parents as VP'
    // }).then((res:any)=>{
    //   this.vendors = res.data
    //   this.vendorsTemp = res.data
    //   // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
    //   // console.log("last index==",this.lastIndex)
    // })
    
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
        resolve(true)
        // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
        // console.log("last index==",this.lastIndex)
      }).catch((e)=>{
        this.observables.showToastMessage({type:1,message:'Problem while showing Vendor Hub.'});
      })
    })
    

  }

  searchVendor(event){
    this.vendorSearchTerm = event.target.value;
    this.showSpinner = true;

    if(this.vendorSearchTerm.length>0){
      this.showSpinner = false
      this.vendors = this.vendorsTemp.filter((item)=>{
        return (item.company_name.toLowerCase().startsWith(this.vendorSearchTerm.toLowerCase()));

      });

    }else{

      this.vendors = this.vendorsTemp;

    }
  }
  searchMyVendor(event){
    this.myVendorSearchTerm = event.target.value;

    if(this.myVendorSearchTerm.length>0){
      this.myVendors = this.myVendorsTemp.filter((item)=>{
        return (item.company_name.toLowerCase().startsWith(this.myVendorSearchTerm.toLowerCase()));

      });

    }else{

      this.myVendors = this.myVendorsTemp;

    }
  }
  searchIntention(event){
    this.intentionSearchTerm = event.target.value;

    if(this.intentionSearchTerm.length>0){
      this.childs = this.childsTemp.filter((item)=>{
        return (item.intention.toLowerCase().startsWith(this.intentionSearchTerm.toLowerCase()));

      });

    }else{

      this.childs = this.childsTemp;

    }
  }


        viewDetails(value){
          this.selectedVendorData = value

          this.vendorForm.patchValue({
            company_name:value.company_name,
            parent_company:value.parent_company,
            address:value.address,
            city:value.city,
            state:value.state,
            zip:value.zip,
            country:value.country,
            contact_number:value.contact_number,
            industry:value.i_name,
            sub_industry:value.s_name,
            ticker:value.ticker,
            stock_price:value.stock_price,
            website_url:value.website_url,
            business_cid:value.business_cid,
            linkedin:value.linkedin,
            company_overview:value.company_overview,
            number_of_locations:value.number_of_locations,
            subsidiaries:value.subsidiaries,
            customer_reviews:value.customer_reviews,
            category:value.category,
            community_reviews:value.community_reviews,
            support_email:value.support_email,
            customer_service_number:value.customer_service_number,
            founded:value.founded,
            competitors:value.competitors,
            revenue:value.revenue,
            employees:value.employees
          })

          this.getChilds(value)
        }

        getChilds(vendor){
          this.api.send("findDb",{
            table:"vendor_childs",
            conditions:[{vendor_id:vendor.vendor_id}]
          }).then((res:any)=>{
            this.childs = res.data
            this.childsTemp = this.childs
          })
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
                    // item.user_id = this.loggedUserInfo.user_id
                    // item.assign_vendor_id = item.vendor_id
                    // item.assign_id = res1.data.insertId
                    // if(this.vendorSearchTerm.length > 0){
                    //   this.arraymove(this.vendors,index,0)
                    // }else{
                    //   this.arraymove(this.vendors,index,0)
                    //   this.vendorsTemp = this.vendors
                    // }

                    
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


        arraymove(arr, fromIndex, toIndex) {
          var element = arr[fromIndex];
          arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, element);
      }

}
