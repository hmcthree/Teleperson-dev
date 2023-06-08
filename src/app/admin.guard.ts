import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { ApiService } from './api.service'
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private api:ApiService, private router:Router){

  }
  canActivate():boolean{
    // console.log("loggrf==",this.router.url)
    if(this.api.loggedIn()){
      return true
    }else{
      this.router.navigate(['/login']);
      return false
    }
  }
}
