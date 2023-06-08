import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-concierge',
  templateUrl: './concierge.component.html',
  styleUrls: ['./concierge.component.scss']
})
export class ConciergeComponent implements OnInit {
  modalStatus:boolean = true
  constructor() { }

  ngOnInit(): void {
   
  }

  closeModal(){
    this.modalStatus = false
  }


}
