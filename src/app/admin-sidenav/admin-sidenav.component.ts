import { Component, OnInit,Inject,OnDestroy, Input, HostListener  } from '@angular/core';
import { ObservablesService } from '../observables.service';
import { ApiService } from '../api.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-sidenav',
  templateUrl: './admin-sidenav.component.html',
  styleUrls: ['./admin-sidenav.component.scss']
})
export class AdminSidenavComponent implements OnInit {

  loggedUserInfo:any=[];
  dealerTypes:any=[];
  // loanMasterStatus:boolean = false
  userInfoSubscriber:any
  subMenuStatus:boolean = false
  subPolicyMenuStatus:boolean = false
  approvalMenuStatus:boolean = false
  customerAssignMenuStatus:boolean = false
  subMasterMenuStatus:boolean = false
  subReportsMenuStatus:boolean = false
  adminPermissions:any= null
  selectedTab:any = "Home"
  _menuState:string = 'out'
  showTest:boolean = true
  getScreenWidth: any;
  closeMenuStatus:boolean = false
  @Input() set menuState(menuState){
    this._menuState = menuState
     if(menuState == 'out'){
        this.showTest = false
     }else{
      setTimeout(() => {
        this.showTest = true
      }, 500);
     }
    // console.log("_menu state==",this._menuState)
  }

  constructor(private router:Router,private api:ApiService, private observables:ObservablesService,private fb:FormBuilder) { }

  ngOnDestroy(){
    this.userInfoSubscriber.unsubscribe()
  }


@HostListener('window:resize', ['$event'])
onWindowResize() {

  this.getScreenWidth = window.innerWidth;
  if(this.getScreenWidth <= 767 ){
    this.closeMenuStatus = true
  }else{
    this.closeMenuStatus = false
  }
  // console.log("getScreenWidth==",this.getScreenWidth)
}

  ngOnInit() {

    // this.api.getLoggedAdminInfo().then((res:any)=>{
    //   // console.log("res=",res)
    //   if(res.data.length > 0){
    //     this.loggedUserInfo = res.data[0]
    //   }else{
    //     // console.log("logout==2")
    //     this.api.logOut()
    //   }
    // })

    // this.getDealerTypes()
    this.loggedUserInfo = this.api.userInfo

    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      if(this.loggedUserInfo){

        // this.getPermissions()
      }
    })
    if(this.loggedUserInfo){

      // this.getPermissions()
    }

    this.getScreenWidth = window.innerWidth;

    if(this.getScreenWidth <= 767 ){
      this.closeMenuStatus = true
    }else{
      this.closeMenuStatus = false
    }

    // console.log("getScreenWidth1==",this.getScreenWidth)

  }

  checkActiveRoute(routeStr){
    // console.log(this.router.url)
    // console.log("asd==",this.router.url.includes(routeStr))
    if(this.router.url.includes(routeStr)){
      return true
    }else{
      return false
    }
  }

  goto(page){
    this.api.selectedPageStatus.next({title:page})
    this.selectedTab = page
    if(page == "Home"){
      this.router.navigate(['/app/dashboard'])
    }else if(page == "Vendor Hub"){
      this.router.navigate(["/app/vendor-hub"])
    // }else if(page == "Vendor Lounge"){
    //   this.router.navigate(["/app/vendor-lounge"])
    }else if(page == "Change Password"){
      this.router.navigate(["/app/change-password/"+this.loggedUserInfo.email])
    }
  }

  gotoDashbard(){
    
  }

  gotoCategory(){
    this.closeMenu()
    this.router.navigate(['/app/categories'])
  }
  gotoSubCategory(){
    this.closeMenu()
    this.router.navigate(['/app/sub-categories'])
  }
  gotoUsers(){
    this.closeMenu()
    this.router.navigate(['/app/users'])
  }

  gotoDashboard(){
    this.closeMenu()
    this.api.selectedPageStatus.next({title:"Home"})
    this.router.navigate(['/app/dashboard'])
  }
  profile(){

  }

  gotoSupport(){
    // window.location.href = "mailto:support@teleperson.com";
    this.closeMenu()
    this.router.navigate(['/app/suport'])
  }

  closeMenu(){
    // console.log('called me')
    if(this.closeMenuStatus){

      this.observables.setMenuStatus({menuState:'out'})
    }
  }

  logOut(){
    // console.log("logout==3")
    this.closeMenu();
    localStorage.clear();
    localStorage.setItem("logOutStatus",'1')
    // this.observables.logout();
    this.router.navigate(['/login']);
  }


  showMaster(){
    this.subMenuStatus = true
  }


  addVendor(){
    this.closeMenu();
    this.api.selectedPageStatus.next({title:"Vendor Hub"})
    this.router.navigate(["/app/vendor-hub"])
  }

  vendorLounge(){
    this.api.selectedPageStatus.next({title:"Vendor Lounge"})
    this.router.navigate(["/app/vendor-lounge"])
  }
  changePassword(){
    this.closeMenu();
    this.router.navigate(["/app/change-password/"+this.loggedUserInfo.email])
  }

  addUser(){
    this.closeMenu();
    this.router.navigate(["/app/users"])
  }


}
