import { Component, OnInit,ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup,FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


    loginForm:FormGroup
    resetForm:FormGroup
    returnUrl:any;
    rightbgStatus = false;
    focussableElements:any= []
    focusedIndex:number = 1
    mobilePattern:any = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    emailPattern:any=  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    alertMessage:any = null
    resetStatus:boolean = false
    type:string = 'signin'
    year:any = new Date().getFullYear()
    showSupportStatus:boolean = false
    passwordType:any = 'password'
      constructor(private ele:ElementRef, private route:ActivatedRoute,private fb:FormBuilder,private router:Router,private api:ApiService,private observables:ObservablesService) {

        // this.resetForm = this.fb.group({
        //   email:[null,Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])]
        // });
        this.loginForm = this.fb.group({
          username:[null,Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])],
          password:[null,Validators.compose([Validators.required])],
        });
       

      }

    ngOnInit() {

      // this.focussableElements = this.ele.nativeElement.querySelectorAll('.focussable')
      // if(this.focussableElements .length > 0){
      //   this.focussableElements[0].focus()
      // }


      localStorage.clear()
      localStorage.setItem("logOutStatus",'1')

      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      // const bodyElement = document.body;
      // bodyElement.classList.add("auth-body-bg");
    }

    setIndex(i){
      this.focusedIndex = i
    }

    showReset(){
      this.resetStatus = !this.resetStatus
    }

    reset(value,formDirective:FormGroupDirective){
      this.alertMessage = null
      if(!this.resetForm.valid){
        this.observables.showToastMessage({type:1,message:'Invalid Input'});
        this.alertMessage ={type:1,message:'Invalid Input.'};
        return
      }

      this.api.send("getData",{
        fields:["COUNT(email) as count"],
        table:"users",
        conditions:[{email:value.email, role:'user'}]
      }).then((res:any)=>{
        if(res.data[0].count <= 0){
          this.observables.showToastMessage({type:1,message:'Your email ID does not exist.'});
          this.alertMessage = {type:1,message:'Your email ID does not exist.'}
        }else{
          value.resetPasswordStatus = true
          this.api.send("signup",value).then((response:any)=>{
            // console.log("resonse",response)
            if(response.status){

              this.observables.showToastMessage({type:0,message:"Please check your email to reset your password. Thanks!"});
              this.alertMessage = {type:0,message:"Please check your email to reset your password. Thanks!"}
              this.resetForm.reset()
              this.router.navigate(['/login'])
            }else{
              this.alertMessage = {type:0,message:response.message}
              this.observables.showToastMessage({type:1,message:response.message});
            }

          }).catch((e)=>{
            this.observables.showToastMessage({type:1,message:"Can't send email. Try again!"});
            this.alertMessage ={type:1,message:"Can't send email. Try again!"};
          })
        }
      })
      
    }
    
    login(value){
      this.alertMessage = null
      // console.log(value);
      if(!this.loginForm.valid){
          this.observables.showToastMessage({type:1,message:'Email and Password Required.'});
          this.alertMessage ={type:1,message:'Email and Password Required.'};
          return
      }

      this.api.send("login",{
        user:"user",
        // data:{
          username:value.username,
          password:value.password
        // }
      }).then((response:any)=>{
        // console.log("resonse",response)
        if(response.status){
          if(response.data.length > 0){


              if(response.data[0].active_status){
                if(response.data[0].role == 'user'){
                  this.observables.showToastMessage({type:0,message:'Logging in.'});
                
                  localStorage.setItem("id_token",response.token);
                  this.api.loginStatus.next()
                  localStorage.removeItem("logOutStatus")
                  this.router.navigate(['/app/dashboard']);
                }else{
                  localStorage.clear();
                  localStorage.setItem("logOutStatus",'1')
                  this.observables.showToastMessage({type:1,message:`Hmm, something's not right. Can you try again?`});
                }
              }else{
                localStorage.clear();
                localStorage.setItem("logOutStatus",'1')
                this.observables.showToastMessage({type:0,message:'Administrator will approve your email address Soon, Thank you for registration.'});
                this.alertMessage = {type:0,message:'Administrator will approve your email address Soon, Thank you for registration.'}
                // this.router.navigate(['/login']);
              }
          }else{
            localStorage.clear();
            localStorage.setItem("logOutStatus",'1')
            this.observables.showToastMessage({type:1,message:`Hmm, something's not right. Can you try again?`});
            this.alertMessage ={type:1,message:`Hmm, something's not right. Can you try again?`};
            // this.router.navigate(['/login']);
          }
        }else{
          this.observables.showToastMessage({type:1,message:`Hmm, something's not right. Can you try again?`});
          this.alertMessage ={type:1,message:`Hmm, something's not right. Can you try again?`};
        }

      })

    }

    showSupportPage(){
      this.showSupportStatus = !this.showSupportStatus

    }

    showPassword(type){
      this.passwordType = type
    }


}
