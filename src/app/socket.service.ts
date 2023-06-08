import { Injectable } from '@angular/core';
// import { LoadingService } from './loading.service';
import { ObservablesService } from './observables.service';
import { environment } from '../environments/environment'
import { Subject } from 'rxjs'
declare var io
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket:any;
  removeListenerSubscribe:any;
  interval:any = null;
  serverStatus:any = new Subject<any>();
  networkStatus:boolean = false;
  constructor(private observables:ObservablesService) {}

  startSocket(){
    // this.removeListenerSubscribe =  this.observables.removeListnersStatus.subscribe((data:any)=>{
    //   this.removeLisners()
    // })

    if(typeof io === 'undefined'){
      // console.log("\nServer needs to be running")
     // loading2.loading(true,"hourglass-half","Server is not runnig, please check with support person")
     this.networkStatus = false
      // this.serverStatus.next(true)
      return false
    }

    //constructor has started the io initialization
    var connectionOptions =  {
                "force new connection" : true,
                 "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
                 "timeout" : 10000,                  //before connect_error and connect_timeout are emitted.
                 "transports" : ["websocket"],
                 secure: true,
                 rejectUnauthorized: false,
                 path: '/sockets/socket.io'
            };



   this.socket = io.connect(environment.socketHost,connectionOptions)
    this.socket.on("disconnect",()=>{
      console.log("Disconnected")
      this.networkStatus = false
      // this.serverStatus.next(true)
      // this.loading.loading(true,'exclamation-triangle','Check internet connection<br /> OR <br />Server might be down for maintainence and fixes,<br /> Please contact the support team')
    })

    this.socket.on("connect",()=>{
      console.log("\n\nReconnected")
      this.networkStatus = true
      // this.serverStatus.next(false)
      // this.loading.loading(false)
    })

    this.socket.emit("fired",{status:"Fired Call"});
    // this.serverDateTime();
    // if(localStorage.getItem('role') == 'user'){
    //
    //   this.start();
    //   this.block();
    //   this.resultUpdate();
    //   this.favUpdate();
    //   this.sectionHide();
    //   this.getVoice();
    //   this.logOutStatus();
    // }else if(localStorage.getItem('role') == 'admin'){
    //   this.updateMaster()
    // }

    return true
  }

 //  startSocket(){
 //    this.removeListenerSubscribe =  this.observables.removeListnersStatus.subscribe((data:any)=>{
 //      this.removeLisners()
 //    })
 //
 //
 //    console.log("\nServer need==========",typeof io)
 //
 //    if(typeof io === 'undefined'){
 //     // loading2.loading(true,"hourglass-half","Server is not runnig, please check with support person")
 //      // this.interval = setInterval(()=>{
 //        // this.observables.startSocketStatus.next(typeof io)
 //        this.networkStatus = false
 //        // this.serverStatus.next(false)
 //        this.observables.socketConnectionStatus.next({status:true,message:"Check internet connection OR Server is not runnig, please check with support person",ioType:typeof io})
 //
 //      // },1000)
 //      return false
 //    }
 //
 //    // console.log('interval======================',this.interval)
 //    // clearInterval(this.interval);
 //    // for (var i = 1; i = this.interval; i++){
 //    //   clearInterval(i);
 //    // }
 //    if(typeof io !== 'undefined'){
 //    //constructor has started the io initialization
 //    var connectionOptions =  {
 //                "force new connection" : true,
 //                "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
 //                "timeout" : 10000,                  //before connect_error and connect_timeout are emitted.
 //                "transports" : ["websocket"],
 //                secure: true,
 //                rejectUnauthorized: false,
 //                path: '/sockets/socket.io'
 //            };
 //
 //   this.socket = io.connect(environment.socketHost,connectionOptions)
 //   this.socket.on("connect_failed",()=>{
 //     console.log('connection failed')
 //   })
 //   this.socket.on("error",()=>{
 //     console.log('connection Error')
 //   })
 //    this.socket.on("disconnect",()=>{
 //      console.log("Disconnected")
 //      this.networkStatus = false
 //      // this.serverStatus.next(false)
 //      this.observables.socketConnectionStatus.next({status:true,message:'Check internet connection OR Server is not runnig, please check with support person',ioType:io})
 //      // this.loading.loading(true,'exclamation-triangle','Check internet connection<br /> OR <br />Server might be down for maintainence and fixes,<br /> Please contact the support team')
 //    })
 //
 //    this.socket.on("connect",()=>{
 //      console.log("\n\nReconnected")
 //      this.networkStatus = true
 //      // this.serverStatus.next(true)
 //      this.observables.socketConnectionStatus.next({status:false,message:'Server Connected'})
 //      // this.loading.loading(false)
 //    })
 //
 //    this.socket.emit("fired",{status:"Fired Call"});
 //    // this.serverDateTime();
 //    // if(localStorage.getItem('role') == 'user'){
 //
 //      // this.start();
 //      // this.block();
 //      // this.resultUpdate();
 //      // this.favUpdate();
 //      // this.sectionHide();
 //      // this.getVoice();
 //      // this.logOutStatus();
 //    // }else if(localStorage.getItem('role') == 'admin'){
 //      // this.updateMaster()
 //      this.updatePigmy()
 //    // }
 //    // this.lotUpdate();
 //    // this.amountUpdate();
 //    // this.updateActiveStatus();
 //    // this.messageUpdate();
 //    // this.progressBarUpdate();
 //    this.networkStatus = false
 //    // this.serverStatus.next(false)
 //    console.log('returnig true')
 //    return true
 //  }
 //  }
 //
 //  removeLisners(){
 //      console.log("removeing listners")
 //      this.socket.removeAllListeners()
 //      this.removeListenerSubscribe.unsubscribe();
 //    }
 //
 //
 //
 //  // start(){
 //  //   this.socket.on("start",()=>{
 //  //     console.log("\n\n Start fired")
 //  //
 //  //     this.observables.start();
 //  //   })
 //  // }
 //  // block(){
 //  //   this.socket.on("block",(data)=>{
 //  //     console.log("\n\n Block fired")
 //  //
 //  //     this.observables.block(data);
 //  //   })
 //  // }
 //  // resultUpdate(){
 //  //   // console.log("listing")
 //  //   this.socket.on("updateResult",(data)=>{
 //  //     console.log("\n\nUpdate Result fired",data)
 //  //
 //  //     this.observables.refreshResult(data);
 //  //   })
 //  // }
 //  // favUpdate(){
 //  //   // console.log("listing")
 //  //   this.socket.on("updateFavorite",(data)=>{
 //  //     console.log("\n\nUpdate Fav fired",data)
 //  //
 //  //     this.observables.refreshFavorite(data);
 //  //   })
 //  // }
 //  // logOutStatus(){
 //  //   // console.log("listing")
 //  //   this.socket.on("logOut"+localStorage.getItem("userId"),(data)=>{
 //  //     console.log("\n\nlogOutStatus fired",data)
 //  //
 //  //     this.observables.logOutStatus();
 //  //   })
 //  // }
 //
 //
 //  // updateMaster(){
 //  //   console.log("listning for master")
 //  //   this.socket.on("updateMaster",(data)=>{
 //  //     console.log("\n\nUpdate Master fired",data)
 //  //     if(data.data.type=='match' || data.data.type == 'session'){
 //  //
 //  //       this.observables.refreshTableList(data);
 //  //     }else{
 //  //       this.observables.refreshKhadaTossTableList(data);
 //  //     }
 //  //   })
 //  // }
 //  updatePigmy(){
 //    console.log("listning for Pigmy")
 //    this.socket.on("updatePigmy",(data)=>{
 //      console.log("\n\nUpdate Pigmy fired",data)
 //
 //        this.observables.refreshPigmy(data);
 //
 //    })
 //  }
 //  // sectionHide(){
 //  //   // console.log("listing")
 //  //   this.socket.on("sectionHide",(data)=>{
 //  //     console.log("\n\nsection Hide fired",data)
 //  //
 //  //     this.observables.hideSection(data);
 //  //   })
 //  // }
 //  // serverDateTime(){
 //  //   // console.log("listing")
 //  //   this.socket.on("serverDateTime",(data)=>{
 //  //     // console.log("\n\nserverDateTime fired",data)
 //  //
 //  //     this.observables.serverDateTime(data);
 //  //   })
 //  // }
 //
 //
 //
 // listen(listner){
 //   return new Promise((resolve,reject)=>{
 //     this.socket.on(listner,(data)=>{
 //       resolve(data)
 //     })
 //   })
 // }
 //
 // send(listnerName,data){
 //     // console.log("listnerName=",listnerName)
 //     this.socket.emit("fired",{status:"Fired Call"});
 //
 //     let t = Date.now()+"-"+Math.random()*9999
 //
 //     return new Promise((resolve,reject)=>{
 //
 //       this.socket.once(listnerName+t+"Response",(response)=>{
 //         if(!response.status){
 //
 //           reject(response)
 //         }
 //
 //          resolve(response)
 //       })
 //
 //
 //         this.socket.emit(listnerName,{t:t,arg:data})
 //
 //
 //       // console.log("\n\n Send fired for: ",listnerName)
 //       // console.log("\n\n With Time: ",t)
 //
 //     })
 //   }



}
