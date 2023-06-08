import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-vendor-hub',
  templateUrl: './vendor-hub.component.html',
  styleUrls: ['./vendor-hub.component.scss']
})
export class VendorHubComponent implements OnInit {
  showTopSection:boolean = true
  showPophoverStatus:boolean = false
  showTopSubscriber:any
  sort:string = 'asc'
  constructor(private api:ApiService, private router:Router) { }

  ngOnDestroy(){
    // this.showTopSubscriber.unsubscribe()
  }
  ngOnInit(): void {
    // this.api.selectedPageStatus.next({title:'Vendor Hub',searchStatus:false,backStatus:false})
    this.api.selectedPageStatus.next({title:'Vendor Hub'})
    // this.showTopSubscriber = this.api.showTopStatus.subscribe((res)=>{
    //   this.showTopSection = res.status
    // })
  }

  setPage(page){
    
  }

  gotoVendorLounge(){

    this.router.navigate(['app/vendor-lounge'])
  }

  sortChange(){
    this.sort = (this.sort == 'asc')?'desc':'asc'
    this.api.sortStatus.next({sortBy:this.sort})
  }

  gotoPlaidVendor(){
    this.router.navigate(['app/vendor-chair'])
  }

  showPophover(){
    this.showPophoverStatus = !this.showPophoverStatus
  }

  filter(){

  }
  lounge(){

  }
  listview(){

  }
  share(){

  }
  
}
