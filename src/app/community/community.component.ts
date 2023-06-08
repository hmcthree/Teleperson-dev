import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ApiService } from 'src/app/api.service';
import { ObservablesService } from 'src/app/observables.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.scss']
})
export class CommunityComponent implements OnInit {
  host:any = environment.host
  loggedUserInfo:any =null
  userInfoSubscriber:any
  showSpinner:boolean = true
  iterator:any = new Subject()
  iteratorSubscriber:any
  communities:any = []
  constructor(private cd: ChangeDetectorRef, private router:Router,private route:ActivatedRoute, private api:ApiService, private observables:ObservablesService) { }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
  }
  ngOnInit(): void {
    this.loggedUserInfo = this.api.userInfo
    

    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
        if(this.loggedUserInfo){
         this.getCommunity()
        }
    })

    if(this.loggedUserInfo){
      //  this.getVendors()
       this.getCommunity()
    }
  }

  ngAfterContentChecked(){
    this.cd.detectChanges()
  }



  getCommunity(){
    this.api.send("queryDb",{
      sql:`SELECT ANY_VALUE(V.user_id) as user_id,ANY_VALUE(vendor_id) as vendor_id, ANY_VALUE(first_name) as first_name,ANY_VALUE(last_name) as last_name, ANY_VALUE(profile) as profile FROM user_assigned_vendors as V left join users as U on(U.user_id = V.user_id) WHERE vendor_id IN (SELECT ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL and user_id = ${this.loggedUserInfo.user_id} group by UV.vendor_id) and V.user_id != ${this.loggedUserInfo.user_id} group by user_id ORDER BY vendor_id ASC LIMIT 8`
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

  gotoOverview(item){
    // this.api.selectedPageStatus.next({title:"Company Overview"})
    // this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['/app/vendor-overview'],{state: { vendor: item },relativeTo: this.route})
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
