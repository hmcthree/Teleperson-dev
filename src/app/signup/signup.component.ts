import { Component, OnInit,ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup,FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'
import { environment } from 'src/environments/environment.prod';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {


  signupForm:FormGroup
  returnUrl:any;
  rightbgStatus = false;
  focussableElements:any= []
  referedBy:any= null
  focusedIndex:number = 1
  passStatus:boolean = false
  mobilePattern:any = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
  emailPattern:any=  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  type:string = 'signup'
  year:any = new Date().getFullYear()
  showSupportStatus:boolean = false
    constructor(private ele:ElementRef, private route:ActivatedRoute,private fb:FormBuilder,private router:Router,private api:ApiService,private observables:ObservablesService) {

      this.route.params.subscribe((userInfo:any)=>{
        if(userInfo !== undefined && Object.keys(userInfo).length > 0){
          let userMail = this.api.decrypt(environment.salt, userInfo.userId)
          this.getInvitationByDetails(userMail)
        }else{
          this.referedBy = null 
        }
      })
      this.signupForm = this.fb.group({
        firstname:[null,Validators.compose([Validators.required])],
        lastname:[null,Validators.compose([Validators.required])],
        usertype:['user',Validators.compose([Validators.required])],
        active_status:[1],
        email:[null,Validators.compose([Validators.required,Validators.pattern(this.emailPattern)])],
      });


    }

  ngOnInit() {
    localStorage.clear()
    localStorage.setItem("logOutStatus",'1')

    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  getInvitationByDetails(mail){
    this.api.send("getData",{
      fields:["user_id"],
      table:"users",
      conditions:[{email:mail}]
    }).then((res:any)=>{
      if(res.data.length > 0){
        this.referedBy = res.data[0]
      }else{
        this.referedBy = null
      }
    }).catch((e)=>{
      this.referedBy = null
    })
  }

  showPass(){
    this.passStatus = !this.passStatus
  }

  setIndex(i){
    this.focusedIndex = i
  }

  signup(value){
    // console.log(value);
    if(!this.signupForm.valid){
        this.observables.showToastMessage({type:1,message:'Invalid Input!'});
        return
    }

    this.api.send("getData",{
      table:'users',
      conditions:[{email:value.email,role:'user'}]
    }).then((res:any)=>{
     
      if(res.data.length > 0){
        this.observables.showToastMessage({type:1,message:'We know you! Your email already exists in our system!'});
      }else{
        this.api.send("signup",value).then(async (response:any)=>{
          // console.log("resonse",response)
          if(response.hasOwnProperty('status')){
            if(!response.status){
              this.observables.showToastMessage({type :1,message:'Oops! Some problem occured while signup. Please try again!'});
              
            }else{
              if(response.hasOwnProperty('data')){
                if(response.data.affectedRows){
                  if(this.referedBy){
                    this.api.send("updateSignupStatus",{referedBy:this.referedBy.user_id,email:value.email})
                    .then((upRes:any)=>{
                      this.observables.showToastMessage({type:0,message:'Awesome! Check your email for next steps!'});
                      this.signupForm.reset()
                      this.router.navigate(['/login'])  
                    }).catch((e)=>{
                      this.observables.showToastMessage({type:0,message:'Awesome! Check your email for next steps!'});
                      this.signupForm.reset()
                      this.router.navigate(['/login'])  
                    })
                  }else{
                    this.observables.showToastMessage({type:0,message:'Awesome! Check your email for next steps!'});
                    this.signupForm.reset()
                    this.router.navigate(['/login'])  
                  }
      
                  
                }else{
                  this.observables.showToastMessage({type :1,message:'Oops! Some problem occured while signup. Please try again!'});
                }
              }else{
                this.observables.showToastMessage({type :1,message:'Oops! Some problem occured while signup. Please try again!'});
              }
            }
          }else{

          }
    
        }).catch((e)=>{
          this.observables.showToastMessage({type :1,message:'Oops! Some problem occured while signup. Please try again!'});
        })
      }
    }).catch((e)=>{
      this.observables.showToastMessage({type :1,message:'Oops! Some problem occured while signup. Please try again!'});
    })
  }

  showSupportPage(){
    this.showSupportStatus = !this.showSupportStatus

  }
}
