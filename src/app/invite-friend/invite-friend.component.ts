import { Component, OnInit, OnDestroy } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import { ApiService } from '../api.service';
import { ObservablesService } from '../observables.service';
import { environment } from 'src/environments/environment.prod';
environment
@Component({
  selector: 'app-invite-friend',
  templateUrl: './invite-friend.component.html',
  styleUrls: ['./invite-friend.component.scss']
})
export class InviteFriendComponent implements OnInit {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  emails:any = [];
  addOnBlur = true;
  invitees:any = []
  userInfoSubscriber:any
  loggedUserInfo:any = null
  invite_link:string = environment.socketHost +'signup/'
  emailPattern:any=  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  constructor(private api:ApiService, private observables:ObservablesService) { }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
  }

  ngOnInit(): void {
    this.loggedUserInfo = this.api.userInfo
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
        this.loggedUserInfo = res
          if(this.loggedUserInfo){
            this.invite_link = this.invite_link + this.api.crypt(environment.salt, this.loggedUserInfo.email);
            this.getInvitees()
          }
      })

      if(this.loggedUserInfo){
        this.invite_link = this.invite_link + this.api.crypt(environment.salt, this.loggedUserInfo.email);
        this.getInvitees()
      }
  }

  getProfileInitials(){
    // if(this.profileInfo){

    //   return this.profileInfo?.first_name[0] + this.profileInfo?.last_name[0]
    // }
  }

  getInvitees(){
    this.api.send("findDb",{
      fields:["UI.email,UI.invited_by_user_id, UI.sign_up_status,U.first_name,U.last_name, U.profile"],
      table:'user_invitees as UI',
      joins:[{
        table:'users as U',
        type:"left",
        conditions:["U.email = UI.email"]
      }],
      conditions:[{invited_by_user_id:this.loggedUserInfo.user_id}]
    }).then((res:any)=>{
      this.invitees = res.data
    })
  }

  add(event: MatChipInputEvent) {
    let value = event.value.trim();
    if(value.match(this.emailPattern)){
        // Add our fruit
      if (value) {
        this.emails.push(value);
      }

      // Clear the input value
      event.chipInput!.clear();
    }
    // else{
    //   this.observables.showToastMessage({type:1,message:"Invalid Email.."})
    // }
  
  }

  remove(email:any) {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  saveInvitees(){
    // console.log("emails==",this.emails)
    // let query = 'INSERT INTO user_invitees(invited_by_user_id, email) VALUES '
    // for(let i=0;i<this.emails.length;i++){
    //     if(i < this.emails.length - 1)
    //       query += '('+this.loggedUserInfo.user_id+',"'+this.emails[i]+'"),' 
    //     else
    //         query += '('+this.loggedUserInfo.user_id+',"'+this.emails[i]+'")'
    // }
    // this.api.send("queryDb",{
    //   sql:query
    // }).then((res:any)=>{
    //   console.log("res==",res)
    // })
    this.api.send("sendInvites",{user_id:this.loggedUserInfo.user_id,username:this.loggedUserInfo.first_name+" "+this.loggedUserInfo.last_name,invite_link:this.invite_link, emails:this.emails}).then((res:any)=>{
      // console.log("res==",res)
      if(res.status){
        this.emails = []
        this.observables.showToastMessage({type:0,message:"Invitation sent."})
        this.getInvitees()
      }else{  
        this.observables.showToastMessage({type:1,message:res.message})
      }
    }).catch((e:any)=>{
      this.observables.showToastMessage({type:1,message:"Oops! Problem while sending invitation. Try again."})
    })
  }

  copyLink(){
    navigator.clipboard.writeText(this.invite_link);
    var sb:any = document.getElementById("snackbar");

    //this is where the class name will be added & removed to activate the css
    sb.className = "show";

    setTimeout(()=>{ sb.className = sb.className.replace("show", ""); }, 3000);
  }

  

}
