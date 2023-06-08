import {Component,OnInit, ViewChild, OnDestroy, ElementRef} from '@angular/core';
import { ApiService } from '../api.service'
import { ActivatedRoute } from '@angular/router'
import { ObservablesService } from '../observables.service'
import { FormBuilder, FormGroup, Validators} from '@angular/forms'
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';
import {map, startWith} from 'rxjs/operators';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-see-profile',
  templateUrl: './see-profile.component.html',
  styleUrls: ['./see-profile.component.scss']
})
export class SeeProfileComponent implements OnInit {
host:any = environment.host
  loggedUserInfo:any = null
  profileInfo:any = null
  userInfoSubscriber:any
  showSpinner:boolean = true
  iterator:any = new Subject()
  iteratorSubscriber:any
  communities:any = []
  community_user_id:any = null
    constructor(private route:ActivatedRoute, private router:Router,private fb:FormBuilder,private activatedRoute:ActivatedRoute,private api:ApiService,private observables:ObservablesService) {

      this.route.params.subscribe((params:any)=>{
        console.log("params===",params)
        if(params.userId){
          this.community_user_id = params.userId
          this.getUserInfo()
          this.getCommunity()
        }
      })
      // Assign the data to the data source for the table to render
      // this.loggedUserInfo = this.api.userInfo
      // // console.log("asd==1",this.loggedUserInfo)
      // this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      //   this.loggedUserInfo = res
      //   this.getUserInfo()
      //   this.getCommunity()
      // })

      // if(this.loggedUserInfo){
      //   this.getUserInfo()
      //   this.getCommunity()
      // }
    }

    ngOnDestroy(){
    }

    ngOnInit(): void {
      
    }

getUserInfo(){
  this.api.send("findDb",{
    fields:["user_id,first_name,last_name,mobile,city,email,profile,facebook, instagram, linkedin, twitter"],
    table:'users',
    conditions:[{user_id:this.community_user_id}]
  }).then((res:any)=>{
    if(res.data.length > 0){

      this.profileInfo = res.data[0]
      // this.first_name =  this.profileInfo?.first_name?this.profileInfo?.first_name:''
      // this.last_name =  this.profileInfo?.last_name?this.profileInfo?.last_name:''
      // this.email =  this.profileInfo?.email
      // this.mobile =  this.profileInfo?.mobile?this.profileInfo?.mobile:''
      // this.city =  this.profileInfo?.city?this.profileInfo?.city:'
      
      
    }else{
      this.observables.showToastMessage({type:1,message:'Problem while getting profile Info!'});
    }
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



getProfileInitials(){
  if(this.profileInfo){
    return this.profileInfo?.first_name[0] + this.profileInfo?.last_name[0]
  }
}


  getCommunity(){
    this.api.send("queryDb",{
      sql:`SELECT ANY_VALUE(V.user_id) as user_id,ANY_VALUE(vendor_id) as vendor_id, ANY_VALUE(first_name) as first_name,ANY_VALUE(last_name) as last_name, ANY_VALUE(profile) as profile FROM user_assigned_vendors as V left join users as U on(U.user_id = V.user_id) WHERE vendor_id IN (SELECT ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL and user_id = ${this.community_user_id} group by UV.vendor_id) and V.user_id != ${this.community_user_id} group by user_id ORDER BY vendor_id ASC LIMIT 4`
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


  getCommunityProfileInitials(user){
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
