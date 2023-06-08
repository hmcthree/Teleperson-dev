import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment'
import { HttpParams, HttpRequest } from '@angular/common/http';
import { ObservablesService } from './observables.service'
// import { Response, Headers, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs'
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiURL:string = environment.apiHost;

  httpOptions = {
    headers:new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  options: any;
  headers: any;
  userInfo:any = null
  userInfoStatus:any = new Subject<any>()
  selectedPageStatus:any = new Subject<any>()
  searchTerm:any = new Subject<any>()
  loginStatus:any = new Subject<any>()
  sortStatus:any = new Subject<any>()
  showTopStatus:any = new Subject<any>()
  subscriber:any
  networkStatus:boolean = false
  networkSubscriber:any;
  isElectronApp:boolean = false
  constructor(private observables:ObservablesService, private router:Router, private http: HttpClient) {

    this.subscriber = this.loginStatus.subscribe((resp:any)=>{
      // console.log("verify")
      if(localStorage.getItem('id_token')){
        this.send("verifyToken",{user:'admin'}).then((res:any)=>{
          // console.log("verified res1=",res)
          if(res.status){
            this.userInfo = res.data[0]
            this.userInfoStatus.next(this.userInfo)
          }else{
            this.observables.showToastMessage({type:1, message:"Hey! It looks like your session expired. Please log in again. Thanks!"})
            this.logOut()
          }
        })
      }else{
        this.logOut()
      }
    })

    if(localStorage.getItem('id_token')){
      this.send("verifyToken",{user:'admin'}).then((res:any)=>{
        // console.log("verified res2=",res)
        if(res.status){
          localStorage.setItem("logOutStatus",'0')
          this.userInfo = res.data[0]
          this.userInfoStatus.next(this.userInfo)
        }else{
          this.observables.showToastMessage({type:1, message:"Hey! It looks like your session expired. Please log in again. Thanks!"})
          this.logOut()
        }
      })
    }else{
      console.log('calling logout')
      // this.logOut()
    }
  }

  ngOnDestroy(){
    this.subscriber.unsubscribe()
    this.networkSubscriber.unsubscribe()
  }


  send(apiName,data){
    // console.log("networkStatus3 ==",this.networkStatus)
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    // console.log("Data==",data);
    let listnerAPI = "";
    switch(apiName){
      case "findDb":
       listnerAPI = "get-data"
      break;
      case "getData":
       listnerAPI = "getData"
      break;
      case "insertDb":
      listnerAPI = "insert-data"

      break;
      case "updateDb":
      listnerAPI = "update-data"

      break;
      case "deleteDb":
      listnerAPI = "delete-data"

      break;
      case "queryDb":
      listnerAPI = "query-data"

      break;

      case "login":
      listnerAPI = "login"

      break;
      case "signup":
      listnerAPI = "signup"

      break;
      case "verifyToken":
      listnerAPI = "verify"

      break;
      case "generateOTP":
      listnerAPI = "generate-otp"

      break;
      case "verifyOtp":
      listnerAPI = "verify-otp"

      break;
      case "updatePassword":
      listnerAPI = "update-password-data"

      break;
      case "changePassword":
      listnerAPI = "change-password"

      break;
      case "verifyPassword":
      listnerAPI = "verify-password"

      break;
      case "encryptCC":
      listnerAPI = "encrypt"

      break;
      case "approveCustomer":
      listnerAPI = "approve-customer"

      break;
      case "registerAdmin":
      listnerAPI = "register-admin"

      break;
      case "registerCustomer":
      listnerAPI = "register-customer"

      break;
      case "bagTransactions":
      listnerAPI = "bag-transactions"

      break;
      case "saveRedemptions":
      listnerAPI = "save-redemption"

      break;
      case "rejectRedemptions":
      listnerAPI = "reject-redemption"

      break;
      case "newvendorList":
      listnerAPI = "mailPlaidVendors"

      break;
      case "sendInvites":
      listnerAPI = "send-invites"

      break;
      case "updateSignupStatus":
       listnerAPI = "update-signup-status"
      break;
      case "vendorNotify":
       listnerAPI = "vendor-notify"
      break;


    }

    let url = this.apiURL+listnerAPI;
    return new Promise((resolve,reject)=>{
      this.http.post(url,data,httpOptions).subscribe((res:any)=>{
        // console.log("Response from api==",res)
        if(res.status && listnerAPI == 'login'){
          if(res.data.length){

            this.userInfo = res.data[0]
            // setTimeout(()=>{
            //   console.log("verified res3=")
            //   this.userInfoStatus.next(this.userInfo)
            // },200)
          }
        }

        if(res.hasOwnProperty('tokenStatus')){
          if(!res.tokenStatus){
            // this.observables.showToastMessage({type:1, message:"Session Expired.. Please Login again.."})
            this.logOut()
          }
        }

        resolve(res);
      },error=>{reject(error);})
    });
  }

  loggedIn(){
  return !!localStorage.getItem('id_token')
}


  logOut(){
    localStorage.clear();
    localStorage.setItem("logOutStatus",'1')
    localStorage.removeItem("id_token")
    this.userInfo = null
    this.router.navigate(['/']);
  }

  public upload(formData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    const options = {
        headers,
        reportProgress: true,
      };
    // console.log("formData==",formData)
	// return this.http.post<any>('http://192.168.43.250:3002/api/upload-file', formData, {
	return this.http.post<any>(environment.apiHost+'upload-file', formData, {
      reportProgress: true,
      observe: 'events'
    });
}

//   public upload(formData) {
//     const headers = new HttpHeaders();
//     headers.append('Content-Type', 'multipart/form-data');
//     headers.append('Accept', 'application/json');
//     // const options = {
//     //     headers,
//     //     reportProgress: true,
//     //   };
//     // console.log("formData==",formData)
// 	// return this.http.post<any>('http://192.168.43.250:3002/api/upload-file', formData, {
// 	return this.http.post<any>(this.apiURL+'upload-file', formData, {
//       reportProgress: true,
//       observe: 'events'
//     });
// }

  public multiUpload(formData) {
    // return new Promise((resolve,reject)=>{

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      // const options = {
        //     headers,
        //     reportProgress: true,
        //   };
        // console.log("formData==",formData)
        // return this.http.post<any>('http://192.168.43.250:3002/api/upload-file', formData, {
        return this.http.post(this.apiURL+'upload-files', formData)
    // })
  }
  download(file){
    // Create url
    let url = this.apiURL+"download-file";
    var body = { filename: file };

    return this.http.post(url, body, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "application/json")
    });
  }

  plaid(path,method,data:any = null){
    let url = this.apiURL+path;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return new Promise((resolve,reject)=>{
      if(method == 'post'){
        this.http.post(url,data,httpOptions).subscribe((res:any)=>{
          resolve(res);
        },error=>{reject(error);})
      }else{
        this.http.get(url,httpOptions).subscribe((res:any)=>{
          resolve(res);
        },error=>{reject(error);})
      }
     
    });
  }

  crypt(salt, text) {
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
  
    return text
      .split("")
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join("");
  };
  
  decrypt (salt, encoded){
    const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
  };



  ////////////////////////////////////////////////////////

  createMXUser(data){
    
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return new Promise((resolve)=>{

      this.http.post(this.apiURL+"create-mx-user",data,httpOptions).subscribe((res:any)=>{
        console.log("MX user Response===",res)
        resolve(res)
      })
    })
  }

  mxApi(api,data){
    
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return new Promise((resolve)=>{

      this.http.post(this.apiURL+api,data,httpOptions).subscribe((res:any)=>{
        // console.log("MX Response===",res)
        resolve(res)
      })
    })
  }
  mx(data){
    
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };

    return new Promise((resolve)=>{

      this.http.post(this.apiURL+"mx",data,httpOptions).subscribe((res:any)=>{
        console.log("MX Response===",res)
        resolve(res)
      })
    })
    // const httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json',
    //    'Accept': 'application/vnd.mx.api.v1+json',
    //    'Accept-Language': 'en-US',
    //    'Authorization': btoa('e9268471-7298-49ff-a746-30fe281304aa:4fb8f13489acd54b3293f91590a15798af9d9767')
    //    })
    // };

    // let data = {      
    //   "widget_url": {        
    //     "client_redirect_url": "https://mx.com",
    //     "color_scheme": "light",
    //     // "current_institution_code": "chase",
    //     // "current_institution_guid": "INS-f1a3285d-e855-b61f-6aa7-8ae575c0e0e9",
    //     // "current_member_guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b",
    //     // "disable_institution_search": false,
    //     // "include_transactions": true,
    //     // "is_mobile_webview": true,
    //     // "mode": "aggregation",
    //     // "ui_message_version": 4,
    //     // "ui_message_webview_url_scheme": "mx",
    //     // "update_credentials": false,
    //     // "widget_type": "connect_widget"
    //   }
    // }
    // this.http.post('https://int-api.mx.com/users/USR-57d91f71-6262-4f81-a564-eac739182436/widget_urls',data,httpOptions).subscribe((res:any)=>{
    //   console.log("URL====res",res)
    // })
  }


}
