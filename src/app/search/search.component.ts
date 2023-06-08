import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  search:any = null
  loggedUserInfo:any = null
  userInfoSubscriber:any
  myVendors:any = []
  relatedVendors:any = []
  host:any = environment.host
  vendorId:any = null
  constructor(private api:ApiService, private route: ActivatedRoute, private router:Router) { }
  ngOnDestroy(){

  }
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.search = params['searchTerm']
      console.log("search==",this.search)
      if(this.loggedUserInfo){
      
        this.searchVendors()
      }
    });

    this.loggedUserInfo = this.api.userInfo
    this.userInfoSubscriber = this.api.userInfoStatus.subscribe((res:any)=>{
      this.loggedUserInfo = res
      if(this.loggedUserInfo){
      
        this.searchVendors()
      }
    })

    if(this.loggedUserInfo){
      
      this.searchVendors()
    }

  }
  
  checkLogo(item){
    if(item.logo){
      return true
    }else{
      return false
    }
  }

  
  searchVendors(){
   
    // return new Promise((resolve)=>{
      this.api.send("findDb",{
        fields:["VP.*, UV.user_id, UV.vendor_id as assign_vendor_id, UV.assign_id"],
        table:'vendor_parents as VP',
        joins:[{
          table:"user_assigned_vendors as UV",
          type:"left",
          conditions:["UV.vendor_id = VP.vendor_id"]
        }
      ],
        conditions:[{'UV.user_id':this.loggedUserInfo.user_id, "VP.company_name LIKE ":`%${this.search}%`}],
        order:"FIELD('UV.user_id', "+this.loggedUserInfo.user_id+") ASC",
        grooupBy:'UV.vendor_id'
      }).then((res:any)=>{
        this.myVendors = res.data
        if(this.myVendors.length > 0){
          console.log("myVendors==",this.myVendors)
          this.vendorId = this.myVendors[0].vendor_id
          this.getRelatedVendors()
         
        }else{
          this.relatedVendors = []
          this.vendorId = null
        }
        // this.myVendorsTemp = res.data
        // resolve(true)
        // this.lastIndex = this.vendors.map(el => el.user_id).lastIndexOf(this.loggedUserInfo.user_id)
        // console.log("last index==",this.lastIndex)
      }).catch((e)=>{
        // this.observables.showToastMessage({type:1,message:'Problem while Showing Vendor Hub.'});
      })
    // })
    

  }

  getRelatedVendors(){
    if(this.myVendors[0].industry){
      // this.api.send("queryDb",{
      //   sql:`select * from vendor_parents as VP left join user_assigned_vendors as UV on(UV.vendor_id = VP.vendor_id) where industry='${this.myVendors[0].industry}',VP.vendor_id != ${this.myVendors[0].vendor_id} group by VP.vendor_id HAVING count(DISTINCT 'UV.user_id') = ${this.loggedUserInfo.user_id};`
      // // })
      
      this.api.send("findDb",{
        fields:["ANY_VALUE(VP.company_name) as company_name, ANY_VALUE(VP.vendor_id) as vendor_id, ANY_VALUE(VP.logo) as logo, ANY_VALUE(UV.user_id) as user_id"],
        table:'vendor_parents as VP',
        joins:[{
          table:"user_assigned_vendors as UV",
          type:"left",
          conditions:["UV.vendor_id = VP.vendor_id"]
        }],
        conditions:[{industry:this.myVendors[0].industry,"VP.vendor_id !":this.vendorId}],
        groupBy:"VP.vendor_id"
      }).then((res:any)=>{
        this.relatedVendors = res.data

      })
    }
  }

  gotoOverview(item){
    // this.api.selectedPageStatus.next({title:"Company Overview"})
    // this.api.selectedPageStatus.next({title:'Company Overview',searchStatus:false,backStatus:true})
    this.router.navigate(['/app/vendor-overview'],{state: { vendor: item },relativeTo: this.route})
    
    // this.router.navigate(['../vendor-overview'],{state: { vendor: item },relativeTo: this.route})
    
  }

}
