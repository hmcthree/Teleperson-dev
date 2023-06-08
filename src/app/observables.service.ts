import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ObservablesService {
  toastMessageStatus:any = new Subject<any>();
  menuStatus:any = new Subject<any>();
  showPopupStatus:any = new Subject<any>();
  updateApprovedStatus:any = new Subject<any>();
  closeStoreStatus:any = new Subject<any>();
  hideShowCustomerRegister:any = new Subject<any>();
  updateApprovedRedemptionStatus:any = new Subject<any>();
  tabMenuStatus:any = new Subject<any>();
  prfileChangedStatus:any = new Subject<any>();
  myVendorsRefreshStatus:any = new Subject<any>();

  constructor() { }
  showToastMessage(data){
    this.toastMessageStatus.next(data);
  }

  setMenuStatus(data){
    this.menuStatus.next(data);
  }

}
