import {Component,OnInit, ViewChild, OnDestroy, ViewEncapsulation} from '@angular/core';
import { ApiService } from '../api.service'
import { ActivatedRoute } from '@angular/router'
import { ObservablesService } from '../observables.service'
import { FormBuilder, FormGroup} from '@angular/forms'
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router'
import { Subject } from 'rxjs';
import * as widgetSdk from "@mxenabled/web-widget-sdk"
import {AfterViewInit,ElementRef} from '@angular/core';
declare const chat: any;
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminDashboardComponent implements OnInit {
  host:any = environment.host
  loggedUserInfo:any = null
  userInfoSubscriber:any
  myVendors:any = []
  myVendorsTemp:any = []
  popoverIndex:any=''
  searchSubscriber:any
  showSpinner:boolean = true
  iterator:any = new Subject()
  iteratorSubscriber:any
  communities:any = []
  modalStatus:boolean = false
    constructor(private route:ActivatedRoute, private router:Router,private fb:FormBuilder,private activatedRoute:ActivatedRoute,private api:ApiService,private observables:ObservablesService) {


      // Assign the data to the data source for the table to render
      this.loggedUserInfo = this.api.userInfo
      // console.log("asd==1",this.loggedUserInfo)
      this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
        this.loggedUserInfo = res
        // console.log("asd=home=",this.loggedUserInfo)
        if(this.loggedUserInfo.video_status == 0){
          this.modalStatus = true
          this.api.send("updateDb",{
            table:'users',
            data:{
              video_status:1
            },
            conditions:[{user_id:this.loggedUserInfo.user_id}]
          })
        }

        this.getMyVendors()
        this.getCommunity()
      })

      // console.log("adminnnn==", this.loggedUserInfo)
      if(this.loggedUserInfo){
        this.getMyVendors()
        this.getCommunity()
      }

      
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
    }

    closeModal(){
      this.modalStatus = false
    }

    ngOnInit(){
      this.api.selectedPageStatus.next({title:'Home',searchStatus:true,backStatus:false})
      
     
      



      

      // var mxConnect = new window.MXConnect({
      //   id: "connect-widget",
      //   iframeTitle: "Connect",
      //   /**
      //    * Callback that for handling all events within Connect.
      //    * Only called in  ui_message_version 4 or higher.
      //    *
      //    * The events called here are the same events that come through post
      //    * messages.
      //    */
      //   onEvent: function (type, payload) {
      //     console.log("onEvent", type, payload);
      //   },
      //   targetOrigin: "*",
      // })

      // mxConnect.load({url}).
    }

    initializeGenesys() {
      chat.initialize();
    }
    // chat logic added

    //  chatLogic(g , e, n, es, ys){
    //   g['_genesysJs'] = e;

    //   g[e] = g[e] || function () {
    
    //     (g[e].q = g[e].q || []).push(arguments)
    
    //   };
    
    //   g[e].t = new Date();
    
    //   g[e].c = es;
    
    //   ys = document.createElement('script'); ys.async = 1; ys.src = n; ys.charset = 'utf-8'; document.head.appendChild(ys);
    //  }

    ngOnDestroy(){
      this.userInfoSubscriber.unsubscribe()
      this.searchSubscriber.unsubscribe()
    }

    showVendorPopup(i){

      if(i.vendor_id == this.popoverIndex){
        this.popoverIndex = ''
      }else{
        this.popoverIndex = i.vendor_id
      }
 
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
        conditions:[{'UV.user_id':this.loggedUserInfo.user_id,'VP.approval_status':1}],
        order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
        grooupBy:'UV.vendor_id',
        limit:3
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

  checkLogo(item){
    if(item.logo){
      return true
    }else{
      return false
    }
  }

  gotoOverview(item){
    // this.api.selectedPageStatus.next({title:"Company Overview"})
    // this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['/app/vendor-overview'],{state: { vendor: item },relativeTo: this.route})
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









  
  getCommunity(){
    this.api.send("queryDb",{
      sql:`SELECT ANY_VALUE(V.user_id) as user_id,ANY_VALUE(vendor_id) as vendor_id, ANY_VALUE(first_name) as first_name,ANY_VALUE(last_name) as last_name, ANY_VALUE(profile) as profile FROM user_assigned_vendors as V left join users as U on(U.user_id = V.user_id) WHERE vendor_id IN (SELECT ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL and user_id = ${this.loggedUserInfo.user_id} group by UV.vendor_id) and V.user_id != ${this.loggedUserInfo.user_id} group by user_id ORDER BY vendor_id ASC LIMIT 4`
      // sql:`SELECT ANY_VALUE(V.company_name) as company_name, ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL GROUP BY UV.vendor_id HAVING COUNT(*) > 1`
    }).then((res:any)=>{
      if(res.data.length > 0){
        this.communities = res.data
        this.getVendors().then((result:any)=>{
          // this.communities = result
          console.log("communities==",this.communities)
          this.showSpinner = false
        })
      }else{
        this.communities = []
        this.showSpinner = false
      }
       
    }).catch((e)=>{
      this.showSpinner = false
    })
  }

  getVendors(){
    return new Promise((resolve)=>{
      let k = 0;
      this.iteratorSubscriber = this.iterator.subscribe((k)=>{
        if(k >= this.communities.length){
          this.iteratorSubscriber.unsubscribe()
          resolve(this.communities)
          
        }else{
          this.api.send("findDb",{
            fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id"],
            table:'vendor_parents as VP',
            joins:[{
              table:"user_assigned_vendors as UV",
              type:"left",
              conditions:["UV.vendor_id = VP.vendor_id"]
            }
          ],
            conditions:[{'UV.user_id':this.communities[k].user_id}],
            order:"FIELD('UV.user_id', "+this.communities[k].user_id+") ASC",
            grooupBy:'UV.vendor_id'
          }).then((res:any)=>{
           
            if(res.data.length >= 5){

              let len = res.data.splice(5).length
              // console.log("remaining==",len)
              if(len){
       
                res.data.push({remaining:len})
              }
       
            }

            this.communities[k].vendors = res.data

            this.iterator.next(k+1)
            
          }).catch((e)=>{
            this.communities[k].vendord = []
            this.iterator.next(k+1)
          })
        }
      })

      this.iterator.next(k)
      
    })
    

  }


  getProfileInitials(user){
      if(user.first_name && user.last_name){

        return user?.first_name[0] + user?.last_name[0]
      }
  }


  isRemaining(vendor){
    if(vendor.hasOwnProperty('remaining')){
      return true
    }else{
      return false
    }
  }



}

