import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
import {map, startWith} from 'rxjs/operators';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  modalStatus:boolean = false
  confirmModalStatus:boolean = false
  incongnitoShowModalStatus:boolean = false
  incongnitoHideModalStatus:boolean = false
  host:any = environment.host
  loggedUserInfo:any = null
  profileInfo:any = null
  userInfoSubscriber:any
  files:any  = [];
  images:any = [];
  iterator:any = new Subject()
  iteratorSubscriber:any
  profileForm:FormGroup
  @ViewChild("fileInput", {static: false}) fileInput: ElementRef;
  constructor(private api:ApiService, private observables:ObservablesService, private fb:FormBuilder) { 
    // Assign the data to the data source for the table to render
      this.loggedUserInfo = this.api.userInfo
      // console.log("asd==1",this.loggedUserInfo)
      this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
        this.loggedUserInfo = res
        this.getUserInfo()
      })

      if(this.loggedUserInfo){
        this.getUserInfo()
      }
    }
  

  ngOnInit(): void {
      this.profileForm = this.fb.group({
        first_name:[null, Validators.compose([Validators.required,Validators.pattern(/^[a-zA-Z]+$/)])],
        last_name :[null, Validators.compose([Validators.required,Validators.pattern(/^[a-zA-Z]+$/)])],
        mobile:[null, Validators.compose([Validators.required,Validators.pattern(/^\d{10}$/)])],
        extension:['+1', Validators.required],
        facebook:[null],
        linkedin:[null],
        twitter:[null],
        instagram:[null]
      })
  }

   patchProfile(){
      // console.log("asd==",this.profileInfo)
      this.profileForm.patchValue({
        first_name:this.profileInfo.first_name,
        last_name:this.profileInfo.last_name,
        mobile:(this.profileInfo.mobile[0] == '+')?this.profileInfo.mobile.substr(2):this.profileInfo.mobile,
        extension:this.profileInfo.mobile.substr(0,2),
        facebook:this.profileInfo.facebook,
        linkedin:this.profileInfo.linkedin,
        twitter:this.profileInfo.twitter,
        instagram:this.profileInfo.instagram
      })
    }
  removeAccount(){
    this.modalStatus = true
  }

  closeModal(){
    this.modalStatus = false
  }

  confirm(){
    this.confirmModalStatus = true
  }

  closeConfirmModal(){
    this.confirmModalStatus = false
  }


  closeShowModal(){
    this.incongnitoShowModalStatus = false
  }
  inCongnitoModeChanged(event){
    console.log(event)
    if(event.target.checked){
      this.incongnitoShowModalStatus = true
    }else{

      this.incongnitoHideModalStatus = true
    }
  }

  closeHideModal(){
    this.incongnitoHideModalStatus = false
  }

  
getUserInfo(){
  this.api.send("findDb",{
    fields:["user_id,first_name,last_name,mobile,city,email,profile,facebook, instagram, linkedin, twitter"],
    table:'users',
    conditions:[{user_id:this.loggedUserInfo.user_id}]
  }).then((res:any)=>{
    if(res.data.length > 0){

      this.profileInfo = res.data[0]
      this.patchProfile()
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



resetFile(){
  this.images = []
  setTimeout(()=>{

    this.fileInput.nativeElement.value = null;

  },200)
  this.files = []

}

getProfileInitials(){
  if(this.profileInfo){
    return this.profileInfo?.first_name[0] + this.profileInfo?.last_name[0]
  }
}

selectFile(file){
  file.click()
}

selectFiles(){

  var fileUpload = this.fileInput.nativeElement;

  // console.log("fileUpload.files=",fileUpload.files)
  // for (let index = 0; index < fileUpload.files.length; index++)
  for (let index = 0; index < 1; index++)
  {
    if(fileUpload.files[index].type == 'image/jpg' || fileUpload.files[index].type == 'image/jpeg'||
        fileUpload.files[index].type == 'image/png'){
         const file = fileUpload.files[index];
         this.files.push({ data: file, inProgress: false, progress: 0});

       let reader = new FileReader();
        reader.onload = (_event) => {
          this.images.push(reader.result);
          this.upload()
        }
        reader.readAsDataURL(fileUpload.files[index]);
        // console.log(this.images)
     }else{
       this.resetFile()
       this.observables.showToastMessage({type:1,message:"Only image files accepted.!"});
     }
  }

}

upload(){
  this.uploadFile(this.files[0],this.loggedUserInfo.user_id,true).then((res:any)=>{
    if(res){
      this.api.send("updateDb",{
        table:"users",
        data:{
          profile:this.files[0].data.name
        },
        conditions:[{user_id:this.loggedUserInfo.user_id}]
      }).then((res:any)=>{
        if(res.data.affectedRows){
          this.getUserInfo()
          this.observables.prfileChangedStatus.next(true)
          this.observables.showToastMessage({type:0, message:"Profile image updated..!"});
          this.resetFile()
        }else{
          this.observables.showToastMessage({type:1, message:"Profile image could not saved, try again..!"});
         
        }
      })
    }else{
      this.observables.showToastMessage({type:1, message:"Upload profile image failed, try again..!"});
      
    }


  })
}

uploadFile(file:any,user_id:any,updateStatus=false) {
  return new Promise((resolve,reject)=>{

    const formData = new FormData();
    formData.append("user_id",user_id)
    formData.append("single_status", "1");
    formData.append("profile_status", "1");
    if(updateStatus){
      formData.append("update_status", "1");
    }else{
      formData.append("update_status", "0");
    }
    formData.append('file', file.data);


      file.inProgress = true;
      this.api.upload(formData).pipe(
        map((event:any) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
            case HttpEventType.Response:
            return event;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          file.inProgress = false;
          return of(`${file.data.name} upload failed.`);
        })).subscribe((event: any) => {
          // console.log("events==",event)
          if (typeof (event) === 'object') {
            // console.log(event.body);
              resolve(event.body)
          }
        });
      })
  }



  update(){
    
    // console.log(this.first_name);  
    // console.log(this.last_name); 
    // console.log(this.email); 
    // console.log(this.mobile); 
    // console.log(this.city); 
    // return
    if(confirm("Are you sure you would like to update profile information?")){

      let value = this.profileForm.getRawValue()
      value.mobile = value.extension + value.mobile
      this.api.send("updateDb",{
        table:"users",
        data:{
          first_name:value.first_name,
          last_name:value.last_name,
          mobile:value.mobile,
          facebook:value.facebook,
          linkedin:value.linkedin,
          twitter:value.twitter,
          instagram:value.instagram,

        },
        conditions:[{user_id:this.profileInfo.user_id}]
      }).then((res:any)=>{
        if(res.data.affectedRows){
          this.observables.showToastMessage({type:0, message:"Profile information updated!"});
          this.getUserInfo()
        }else{
          this.observables.showToastMessage({type:1, message:"Profile information could not saved, try again..!"});
        }
      }).catch((e)=>{
          this.observables.showToastMessage({type:1, message:"Profile information could not saved, try again..!"});
      })
    }
    
  }

}
