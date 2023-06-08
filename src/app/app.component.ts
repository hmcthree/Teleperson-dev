import { Component,OnInit, ElementRef,Renderer2 } from '@angular/core';
import { ApiService } from './api.service'
import { ObservablesService } from './observables.service';
import { SocketService } from './socket.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // host: {'(window:keydown)': 'hotkeys($event)'}
})
export class AppComponent {
  title = 'TelePerson';
  messageColor:any
  toastMessage:string = ''
  messageStatus:boolean = false;
  loggedUserInfo:any=[];
  dataFreez:boolean = false
  freezMessage:string=''
  localServerStatus:boolean = false
  hotkeys(event){
    // console.log("events=",event)
    if(event.altKey && event.keyCode == 78){

    }
  }
  

  ngAfterViewInit() {
    setTimeout(_ => this.dataFreez = false);

    this.socket.serverStatus.subscribe(loadingRes=>{
      if(loadingRes){
        setTimeout(_ => this.dataFreez = loadingRes);
        // this.loadingMessage = loadingRes.message;
        this.freezMessage = 'Check internet connection OR Server is not runnig, please check with support person'
      }else{
        setTimeout(_ => this.dataFreez = false);
        this.freezMessage = 'Server Connected..'

      }
    })
 }


  constructor(private readonly elementRef: ElementRef,private renderer: Renderer2,public socket:SocketService,public route:ActivatedRoute, private router:Router, private observables:ObservablesService, private api:ApiService){


    this.observables.toastMessageStatus.subscribe((data:any)=>{
      this.messageColor = data.type;
      this.toastMessage = data.message;
      this.messageStatus = true;
      setTimeout(()=>{ this.messageStatus = false }, 3000);
    })


  }


  ngOnInit(){

      if(!this.socket.startSocket()){
        // console.log('asd')
        this.dataFreez = true
        this.freezMessage = 'Check internet connection OR Server is not runnig, please check with support person'
      }else{
        // console.log('asd1')
        this.dataFreez = true
        this.freezMessage = 'Server Connected..'
      }

  }


    loadSocket(){
      this.socket.startSocket()
    }


  removeFrees(){
    this.freezMessage = ''
  }

}
