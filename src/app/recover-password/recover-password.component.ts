import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators, FormGroup,FormGroupDirective } from '@angular/forms';
import { Router } from '@angular/router'
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {

  resetForm:FormGroup
  alertMessage:any = null
  showSupportStatus:boolean = false
  emailPattern:any=  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  constructor(private fb:FormBuilder, private api:ApiService, private observables:ObservablesService, private router:Router) { 
     this.resetForm = this.fb.group({
        email:[null,Validators.compose([Validators.required, Validators.pattern(this.emailPattern)])]
      });
  }

  ngOnInit(): void {
  }

  reset(value){
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


  showSupportPage(){
    this.showSupportStatus = !this.showSupportStatus
  
  }

}
