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
declare const Genesys: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
host:any = environment.host
  loggedUserInfo:any = null
  profileInfo:any = null
  userInfoSubscriber:any
  myVendors:any = []
  myVendorsTemp:any = []
  popoverIndex:any=''
  searchSubscriber:any
  files:any  = [];
  images:any = [];
  first_name:any = 'First Name'
  last_name:any = 'Last Name'
  email:any = 'Email ID'
  mobile:any = '1234567890'
  city:any = 'London, United Kingdom'
  editStatus:boolean = false
  showSpinner:boolean = true
  iterator:any = new Subject()
  iteratorSubscriber:any
  communities:any = []
  profileForm:FormGroup
  @ViewChild("fileInput", {static: false}) fileInput: ElementRef;
  // @ViewChild("el1", {static: false}) el1: ElementRef;
  // @ViewChild("el2", {static: false}) el2: ElementRef;
  // @ViewChild("el4", {static: false}) el4: ElementRef;
  // @ViewChild("el5", {static: false}) el5: ElementRef;
    constructor(private route:ActivatedRoute, private router:Router,private fb:FormBuilder,private activatedRoute:ActivatedRoute,private api:ApiService,private observables:ObservablesService) {


      // Assign the data to the data source for the table to render
      this.loggedUserInfo = this.api.userInfo
      // console.log("asd==1",this.loggedUserInfo)
      this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
        this.loggedUserInfo = res
        this.getUserInfo()
        this.getMyVendors()
        this.getCommunity()
      })

      if(this.loggedUserInfo){
        this.getUserInfo()
        this.getMyVendors()
        this.getCommunity()
      }
    }

    ngOnDestroy(){
      this.searchSubscriber.unsubscribe()
    }

    ngOnInit(): void {
      this.searchSubscriber = this.api.searchTerm.subscribe((searchTerm:any)=>{
        // console.log("Searchig For==",searchTerm)
        if(searchTerm.length > 0){
          this.myVendors = this.myVendorsTemp.filter((item)=>{
            return (item.company_name.toLowerCase().startsWith(searchTerm.toLowerCase()));
    
          });
        }else{
          this.myVendors = this.myVendorsTemp
        }
        
      })
      

      this.profileForm = this.fb.group({
        first_name:[null, Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]+$/)])],
        last_name :[null, Validators.compose([Validators.required, Validators.pattern(/^[a-zA-Z]+$/)])],
        mobile:[null, Validators.compose([Validators.required,Validators.pattern(/^\d{10}$/)])],
        extension:['+1', Validators.required],
        facebook:[null],
        linkedin:[null],
        twitter:[null],
        instagram:[null]
      })
    }

    initializeGenesys() {
      Genesys.initialize();
    }
    //

    editProfile(){
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


  showVendorPopup(i){

    if(i.vendor_id == this.popoverIndex){
      this.popoverIndex = ''
    }else{
      this.popoverIndex = i.vendor_id
    }

}

getUserInfo(){
  this.api.send("findDb",{
    fields:["user_id,first_name,last_name,mobile,city,email,profile,facebook, instagram, linkedin, twitter"],
    table:'users',
    conditions:[{user_id:this.loggedUserInfo.user_id}]
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
  
getMyVendors(){
  return new Promise((resolve)=>{
    this.api.send("findDb",{
      fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id, I.i_name, S.s_name"],
      table:'vendor_parents as VP',
      joins:[{
        table:"user_assigned_vendors as UV",
        type:"left",
        conditions:["UV.vendor_id = VP.vendor_id"]
      },{
        type:"left",
        table:"industries as I",
        conditions:["I.i_id = VP.industry"]
      },{
        type:"left",
        table:"sub_industries as S",
        conditions:["S.s_id = VP.sub_industry"]
      }
    ],
      conditions:[{'UV.user_id':this.loggedUserInfo.user_id,'VP.approval_status':1}],
      order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
      grooupBy:'UV.vendor_id',
      limit:8
    }).then((res:any)=>{
      this.myVendors = res.data
      this.myVendorsTemp = res.data
      resolve(true)
      // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
      // console.log("last index==",this.lastIndex)
    }).catch((e)=>{
      this.observables.showToastMessage({type:1,message:'Problem while showing Vendor Hub.'});
    })
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

removeFromList(item,index){
  if(confirm(`Are you sure you want to remove "${item.company_name}" from your Vendor Hub?`)){
    this.api.send("deleteDb",{
      table:"user_assigned_vendors",
      conditions:[{user_id:this.loggedUserInfo.user_id, vendor_id:item.vendor_id}]
    }).then((res:any)=>{
      if(res.data.affectedRows){
         this.observables.showToastMessage({type:0,message:"Vendor Removed!"})
        item.user_id = null
        item.assign_vendor_id = null
        item.assign_id = null
        this.myVendors.splice(index, 1)
        this.myVendorsTemp = this.myVendors
        this.popoverIndex = ''
        // if(this.vendorSearchTerm.length > 0){
        //   this.arraymove(this.vendors,index,this.vendors.length-1)
          
        // }else{
        //   this.arraymove(this.vendors,index,this.vendors.length-1)
        //   this.vendorsTemp = this.vendors
        // }
        
      }else{
        this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
      }
    }).catch((err)=>{
      this.observables.showToastMessage({type:1,message:"Something went wrong while removing vendor. Try again!"})
    })
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

  edit(){
    this.editStatus = true
  }

  patchValue(field,value){
    console.log(value.innerHTML)
    // return
    if(field == 'first_name'){

      this.first_name = value.innerHTML
    }else if(field == 'last_name'){
      
      this.last_name = value.innerHTML
    }else if(field == 'email'){

      // this.email = event.innerText
    }else if(field == 'mobile'){
      
      this.mobile = value.innerHTML
    }else if(field == 'city'){
      
      this.city = value.innerHTML
    }
  }


  setCaretAtStartEnd( node, atEnd ){
    const sel:any = document.getSelection();
    node = node.firstChild;
    // console.log(node.length)
  
    if( sel.rangeCount ){
        // ['Start', 'End'].forEach(pos =>
          sel.getRangeAt(0)["setEnd"](node, atEnd ? node?.length : 0)
          
        // )
    }
  }

  // focusElement(field){
  //   if(field == 'first_name'){
  //     this.el1.nativeElement.focus()
  //     this.setCaretAtStartEnd(this.el1.nativeElement,1)
  //   }else if(field == 'last_name'){
  //     this.el2.nativeElement.focus()
  //     this.setCaretAtStartEnd(this.el2.nativeElement,1)
  //   }else if(field == 'email'){

  //     // this.email = event.innerText
  //   }else if(field == 'mobile'){
  //     this.el4.nativeElement.focus()
  //     this.setCaretAtStartEnd(this.el4.nativeElement,1)
  //   }else if(field == 'city'){
  //     this.el5.nativeElement.focus()
  //     this.setCaretAtStartEnd(this.el5.nativeElement,1)
  //   }
  // }

  update(){
    
    // console.log(this.first_name);  
    // console.log(this.last_name); 
    // console.log(this.email); 
    // console.log(this.mobile); 
    // console.log(this.city); 
    // return
    if(confirm("Are you sure you would like to update profile information?")){
      this.editStatus = false
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





  

  
  getCommunity(){
    this.api.send("queryDb",{
      sql:`SELECT ANY_VALUE(V.user_id) as user_id,ANY_VALUE(vendor_id) as vendor_id, ANY_VALUE(first_name) as first_name,ANY_VALUE(last_name) as last_name, ANY_VALUE(profile) as profile FROM user_assigned_vendors as V left join users as U on(U.user_id = V.user_id) WHERE vendor_id IN (SELECT ANY_VALUE(V.vendor_id) as vendor_id FROM user_assigned_vendors as UV left join vendor_parents as V on(V.vendor_id = UV.vendor_id) where V.vendor_id IS NOT NULL and user_id = ${this.loggedUserInfo.user_id} group by UV.vendor_id) and V.user_id != ${this.loggedUserInfo.user_id} group by user_id ORDER BY vendor_id ASC LIMIT 4`
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
