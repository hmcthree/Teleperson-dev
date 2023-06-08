import { Component, OnInit, OnDestroy } from '@angular/core';
import { ObservablesService } from '../observables.service'
import { trigger, state, style, transition, animate} from '@angular/animations';
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('out', style({
        transform: 'translate3d(0%, 0, 0)',
        width: '5%'
      })),
      state('in', style({
        transform: 'translate3d(0, 0, 0)',
        width: '15%'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('slide1InOut', [
      state('out', style({
        transform: 'translate3d(100%, 0, 0)',
      })),
      state('in', style({
        transform: 'translate3d(0%, 0, 0)',
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('contentInOut', [
      state('in', style({
        width: '100%',
      })),
      state('out', style({
        width: '100%',
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('backDrop', [
      state('in', style({
        display: 'block',
      })),
      state('out', style({
        display: 'none',
      }))
    ]),
  ]
})
export class AdminLayoutComponent implements OnInit {
  menuState:any = 'in';
  contentState:string = 'out';
  menuObserver:any;
  rightMenuState:string = 'out';
  constructor(private observables:ObservablesService) {
    this.menuObserver = this.observables.menuStatus.subscribe((data:any)=>{
       this.menuState = data.menuState
       this.contentState = data.menuState
       this.rightMenuState = data.menuState
    });
  }

  ngOnDestroy(){
    this.menuObserver.unsubscribe()
  }

  ngOnInit() {
  }

  closeMenu(){
    this.observables.setMenuStatus({menuState:'out'})
  }

  showHide(){
    this.menuState = this.menuState == 'out'?'in':'out'
    this.contentState = this.contentState == 'out'?'in':'out'
    console.log('menu state==',this.menuState)
  }



}
