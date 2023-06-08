import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder, Validators, FormGroupDirective } from '@angular/forms';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';

@Component({
  selector: 'app-suport',
  templateUrl: './suport.component.html',
  styleUrls: ['./suport.component.scss']
})
export class SuportComponent implements OnInit {
  contactForm:FormGroup
  alertMessage:any = null
  loggedUserInfo:any = null
  userInfoSubscriber:any
  constructor(private fb:FormBuilder, private api:ApiService, private observables:ObservablesService) { }
  ngOnDestroy(){

    this.userInfoSubscriber.unsubscribe()
  }
  
  ngOnInit(): void {

    this.loggedUserInfo = this.api.userInfo
    

    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
        // if(this.loggedUserInfo){
         
        // }
    })

    // if(this.loggedUserInfo){
     
    // }

    this.contactForm = this.fb.group({
      email:[null,Validators.compose([Validators.required,Validators.email])],
      message:[null,Validators.compose([Validators.required])]
    })
  }

  sendMessage(value,formDirective:FormGroupDirective){
    // console.log(value)
    value.supportStatus = true
    this.api.send("signup",value).then((response:any)=>{
      // console.log("resonse",response)
      if(response.status){

        this.observables.showToastMessage({type:0,message:"Your message has been sent. Our team will get back to you soon. Thanks!"});
        this.alertMessage = {type:0,message:"Your message has been sent. Our team will get back to you soon. Thanks!"}
        this.contactForm.reset()
        
      }else{
        this.alertMessage = {type:0,message:response.message}
        this.observables.showToastMessage({type:1,message:response.message});
      }

    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:"Can't send email. Try again!"});
      this.alertMessage ={type:1,message:"Can't send email. Try again!"};
    })
  }

}
