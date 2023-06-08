import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { ObservablesService } from '../observables.service'
import { ApiService } from '../api.service'
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder,FormControl, Validators, FormGroup, FormGroupDirective, NgForm } from '@angular/forms';
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent?.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  matcher = new MyErrorStateMatcher();
  passwordForm:FormGroup;
  passStatus:boolean = false
  passStatus1:boolean = false
  email:string = ''
  type:string = 'signin'
  showSupportStatus:boolean = false
  passwordType1:string = 'password'
  passwordType2:string = 'password'
  constructor(private route:ActivatedRoute, private api:ApiService,private fb:FormBuilder, private router:Router,private observables:ObservablesService) { 
    this.route.params.subscribe((params)=>{
      // console.log("params==",params)
      this.email = params.userId
    })
 

  }
  

  ngOnInit() {
    this.api.selectedPageStatus.next({title:'Change Password'})
    this.passwordForm = this.fb.group({
      new_password:['',Validators.compose([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/)])],
      confirm_password:['']
    },{validator: this.checkPasswords });
  }

  showPass(){
    this.passStatus = !this.passStatus
  }
  showPass1(){
    this.passStatus1 = !this.passStatus1
  }

  updatePassword(value){
    // console.log("form value=",value)
    if(this.passwordForm.valid){

      if(confirm("Are you sure you want to set this password?")){


        this.api.send("changePassword",{
          confirm_password:value.confirm_password,
          email:this.email,
          userId:null
        }).then((res:any)=>{

          if(res.status){
            this.passwordForm.reset();
            this.observables.showToastMessage({type:0,message:res.data[0].message})
            this.router.navigate(['/login'])
          }else{
            this.observables.showToastMessage({type:1,message:res.data[0].message})
          }

        })
      }
    }else{
      this.observables.showToastMessage({type:1,message:"Invalid Form Submission"})
    }
  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.new_password.value;
    let confirmPass = group.controls.confirm_password.value;

    return pass === confirmPass ? null : { notSame: true }
 }

 
 showSupportPage(){
  this.showSupportStatus = !this.showSupportStatus

}

showPassword1(type){
  this.passwordType1 = type
}
showPassword2(type){
  this.passwordType2 = type
}


}
