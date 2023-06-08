import { DatePipe, Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';
import { ApiService } from '../../api.service';
import { ObservablesService } from '../../observables.service';
@Component({
  selector: 'app-vendor-overview',
  templateUrl: './vendor-overview.component.html',
  styleUrls: ['./vendor-overview.component.scss']
})
export class VendorOverviewComponent implements OnInit {
  host:any = environment.host
  selectedVendor:any = null
  childs:any = []
  childsTemp:any = []
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 20;
  showTicks = true;
  step = 20;
  thumbLabel = false;
  value = 20;
  telepersonValue = 20;
  vertical = false; 
  tickInterval = 20;
  loggedUserInfo:any =null
  userInfoSubscriber:any
  modalStatus:boolean = false

  constructor(private location:Location, private datePipe:DatePipe, private router:Router, private observables:ObservablesService, private api:ApiService) { 
    this.api.showTopStatus.next({status:false})
    // console.log("vendor in over view==",this.router.getCurrentNavigation()?.extras.state?.vendor)
    if(this.router.getCurrentNavigation()?.extras.state?.vendor !== undefined){
      this.selectedVendor = this.router.getCurrentNavigation()?.extras.state?.vendor
      console.log("selectedVendor=",this.selectedVendor)
      this.getChilds(this.selectedVendor)
      this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
      this.loggedUserInfo = this.api.userInfo
      this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
          this.loggedUserInfo = res    
          if(this.loggedUserInfo){
            this.getFeedBack()
            this.getTelepersonFeedBack()
          }
      })

      if(this.loggedUserInfo){
        this.getFeedBack()
        this.getTelepersonFeedBack()
      }
    }else{
      this.location.back()
    }
  }

  getOverView(overview:any){
    return overview?.length > 260?overview?.slice(0,259):overview
  }

  gotoWebsite(){
    window.open("https://"+this.selectedVendor?.website_url, "_blank");
  }

  ngOnDestroy(){
    this.userInfoSubscriber?.unsubscribe()
  }

  ngOnInit(): void {
    
    
  }

  seeMore(){
    this.modalStatus = true
  }

  closeModal(){
    this.modalStatus = false
  }

  getFeedBack(){
    this.api.send("findDb",{
      table:"vendor_reviews",
      conditions:[{user_id:this.loggedUserInfo.user_id, vendor_id:this.selectedVendor.vendor_id}]
    }).then((res:any)=>{
      if(res.data.length > 0){
        this.value = parseInt(`${res.data[0].review == 'terrible'?20:(res.data[0].review == 'bad'?40:(res.data[0].review == 'ok'?60:(res.data[0].review == 'good'?80:100)))}`)
      }
    })
  }
  getTelepersonFeedBack(){
    this.api.send("findDb",{
      table:"teleperson_reviews",
      conditions:[{user_id:this.loggedUserInfo.user_id, vendor_id:this.selectedVendor.vendor_id}]
    }).then((res:any)=>{
      if(res.data.length > 0){
        this.telepersonValue = parseInt(`${res.data[0].review == 'terrible'?20:(res.data[0].review == 'bad'?40:(res.data[0].review == 'ok'?60:(res.data[0].review == 'good'?80:100)))}`)
      }
    })
  }

  getChilds(vendor){
    this.api.send("findDb",{
      table:"vendor_childs",
      conditions:[{vendor_id:vendor.vendor_id, status:'Approved'}]
    }).then((res:any)=>{
      this.childs = res.data
      this.childsTemp = this.childs
    })
  }

  checkLogo(item){
    if(item?.logo){
      return true
    }else{
      return false
    }
  }

  updateCallCount(item){
    this.api.send("findDb",{
      fields:["calls_count"],
      table:"vendor_parents",
      conditions:[{vendor_id:item.vendor_id}]
    }).then((res:any)=>{
      this.api.send("updateDb",{
        table:'vendor_parents',
        data:{
          calls_count:res.data[0].calls_count + 1
        },
        conditions:[{vendor_id:item.vendor_id}]
      }).then((res1:any)=>{

      })
    })
    
  }

  updateReview(event){
    // console.log("event==",event)
    if(this.loggedUserInfo){

      let value = `${event.value == 20?'terrible':(event.value == 40?'bad':(event.value == 60?'ok':(event.value == 80?'good':'great')))}`
      let date = `${this.datePipe.transform(new Date(),'yyyy-MM-dd')}`
      this.api.send("queryDb",{
        sql:`INSERT INTO vendor_reviews (user_id,vendor_id,review,review_created) VALUES (${this.loggedUserInfo.user_id},${this.selectedVendor.vendor_id},'${value}','${date}') ON DUPLICATE KEY UPDATE review = '${value}', review_created = '${date}'`
      }).then((res:any)=>{
        if(res.data.affectedRows){
          this.observables.showToastMessage({type:0,message:'Thank you for the feedback!'});
        }else{
          this.observables.showToastMessage({type:1,message:'Problem while sending your feedback.'});
        }
      }).catch((e)=>{
        this.observables.showToastMessage({type:1,message:'Problem while sending your feedback.'});
      })
    }
  }
  updateTelepersonValueReview(event){
    // console.log("event==",event)
    if(this.loggedUserInfo){

      let value = `${event.value == 20?'terrible':(event.value == 40?'bad':(event.value == 60?'ok':(event.value == 80?'good':'great')))}`
      let date = `${this.datePipe.transform(new Date(),'yyyy-MM-dd')}`
      this.api.send("queryDb",{
        sql:`INSERT INTO teleperson_reviews (user_id,vendor_id,review,review_created) VALUES (${this.loggedUserInfo.user_id},${this.selectedVendor.vendor_id},'${value}','${date}') ON DUPLICATE KEY UPDATE review = '${value}', review_created = '${date}'`
      }).then((res:any)=>{
        if(res.data.affectedRows){
          this.observables.showToastMessage({type:0,message:'Thank you for the feedback!'});
        }else{
          this.observables.showToastMessage({type:1,message:'Problem while sending your feedback.'});
        }
      }).catch((e)=>{
        this.observables.showToastMessage({type:1,message:'Problem while sending your feedback.'});
      })
    }
  }

}
