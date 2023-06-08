import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ApiService } from '../api.service'
import { ObservablesService } from '../observables.service'
import { Validators, FormGroup, FormBuilder} from '@angular/forms'
import {Router} from '@angular/router'
import {DatePipe,DOCUMENT,Location} from '@angular/common'
import {MatDialog} from '@angular/material/dialog';
import { environment } from '../../environments/environment.prod';
import { VendorLoungeComponent } from '../vendor-lounge/vendor-lounge.component';
@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {
  loggedUserInfo:any = []
  userInfoSubscriber:any
  masterPopupSubscriber:any
  btn:any ='';
  sales_persons:any = []
  dealer_types:any = []
  salesPersonmasterPopupStatus:boolean = false
  dealerTypesmasterPopupStatus:boolean = false
  ratioPopupStatus:boolean = false
  rangePopupStatus:boolean = false
  StatePopupStatus:boolean = false
  salesPersonMasterForm:FormGroup
  dealerTypeMasterForm:FormGroup
  ratioPointMasterForm:FormGroup
  stateMasterForm:FormGroup
  talukaMasterForm:FormGroup
  districtMasterForm:FormGroup
  validity:any = null
   start_date:any = null
  end_date:any = null
  modalType:any = null
  states:any = []
  districts:any = []
  talukas:any = []
  editStateData:any = null
  editDistrictData:any = null
  editTalukaData:any = null
  editSPData:any = null
  editDealerTypeData:any = null
  title:string = ''
  selectedPageSubscriber:any
  searchStatus:boolean = true
  searchText:any = null
  showBackButton:boolean = false
  backRoute:string = '/app/dashboard'
  prfileChangedSubscriber:any
  profileInfo:any = null
  host:any = environment.host
  menuStatus:boolean = true
  fullScreenStatus:boolean = false
  searchForm:FormGroup
  elem: any;
  constructor(@Inject(DOCUMENT) private document: any,private location:Location, public dialog: MatDialog,private datePipe:DatePipe,private router:Router,private api:ApiService,private fb:FormBuilder, private observables:ObservablesService) {
  }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
    this.selectedPageSubscriber.unsubscribe()
    this.prfileChangedSubscriber.unsubscribe()
  }
  ngOnInit(): void {
    this.elem = document.documentElement;
    this.loggedUserInfo = this.api.userInfo
    this.searchForm = this.fb.group({
      search:[null, Validators.required]
    })
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      this.getProfile()
    })
    this.prfileChangedSubscriber = this.observables.prfileChangedStatus.subscribe((res:any)=>{
     this.getProfile()
    })

    if(this.loggedUserInfo){
      this.getProfile()
    }


    this.selectedPageSubscriber = this.api.selectedPageStatus.subscribe((res:any)=>{
      // console.log("head res===",res)
      this.searchText = null
      this.title = res.title
      this.showBackButton = res.backStatus
      if(res.hasOwnProperty('searchStatus')){
        this.searchStatus = true//res.searchStatus
      }else{
        this.searchStatus = true
      }
    })


  }

  openFullscreen() {

    this.fullScreenStatus = true

    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }
/* Close fullscreen */
  closeFullscreen() {

    this.fullScreenStatus = false
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }



  toggleLeftMenu(){
    // this.menuStatus = !this.menuStatus
    const bodyElement = document.body;
    // bodyElement.classList.remove(activeClass);
    // if()
    // add class
    bodyElement.classList.toggle("sidebar-enable");
    
    // this.document.body.classList.toggle("sidebar-enable vertical-collpsed");
    if(992 <= window.innerWidth ){
      bodyElement.classList.toggle("vertical-collpsed");
    }else{
      bodyElement.classList.remove("vertical-collpsed");
    }
  }

  toggleRightMenu(){
    const bodyElement = document.body;
    bodyElement.classList.toggle("right-bar-enabled");
    
  }

  getProfileInitials(){
    if(this.profileInfo){

      return this.profileInfo?.first_name[0] + this.profileInfo?.last_name[0]
    }
  }

  getProfile(){
    this.api.send("findDb",{
      fields:["user_id,first_name,last_name,email,profile"],
      table:'users',
      conditions:[{user_id:this.loggedUserInfo.user_id}]
    }).then((res:any)=>{
      if(res.data.length > 0){
  
        this.profileInfo = res.data[0]
      }else{
        this.observables.showToastMessage({type:1,message:'Problem while getting profile Info..'});
      }
    })
  }

  goBack(){
    this.location.back()
  }

  gotoProfile(){
    this.router.navigate(['/app/profile'])
  }

  gotoDashbard(){
    this.router.navigate(['/app/dashboard'])
  }

  viewDetails(page){
    // this.observables.tabMenuStatus.next({page:page})
    this.router.navigate(["/app/"+page])
  }

  openMenu(){
    this.observables.setMenuStatus({menuState:'in'})
  }

  openDialog() {
    this.router.navigate(['app/vendor-lounge'])
    // const dialogRef = this.dialog.open(VendorLoungeComponent);

    // dialogRef.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
  }

  search(value){
    console.log("event==",value)
    if(this.searchForm.valid){

      this.router.navigate(['app/search',value.search])
    }
    // this.api.searchTerm.next(event.target.value)
  }
  // search(event){
  //   console.log("event==",event.target.value)
  //   this.api.searchTerm.next(event.target.value)
  // }

  logOut(){
    localStorage.clear();
    localStorage.setItem("logOutStatus",'1')
    // this.observables.logout();
    this.router.navigate(['/login']);
  }

}
