import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
  selector: 'app-right-sidenav',
  templateUrl: './right-sidenav.component.html',
  styleUrls: ['./right-sidenav.component.scss']
})
export class RightSidenavComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // this.t("light-mode-switch")
  }

  toggleRightMenu(){
    const bodyElement = document.body;
    bodyElement.classList.toggle("right-bar-enabled");
    
  }

   t(event) {

    let e = event.target.id
    if(1 == $("#light-mode-switch").prop("checked") && "light-mode-switch" === e){
          $("html").removeAttr("dir"),
          $("#dark-mode-switch").prop("checked", !1),
          $("#rtl-mode-switch").prop("checked", !1),
          $("#bootstrap-style").attr("href", "assets/css/bootstrap.min.css"),
          $("#app-style").attr("href", "assets/css/app.min.css"),
          sessionStorage.setItem("is_visited", "light-mode-switch")
    }else if(1 == $("#dark-mode-switch").prop("checked") && "dark-mode-switch" === e){
        $("html").removeAttr("dir"),
          $("#light-mode-switch").prop("checked", !1),
          $("#rtl-mode-switch").prop("checked", !1),
          $("#bootstrap-style").attr("href", "assets/css/bootstrap-dark.min.css"),
          $("#app-style").attr("href", "assets/css/app-dark.min.css"),
          sessionStorage.setItem("is_visited", "dark-mode-switch")
    }else if(1 == $("#rtl-mode-switch").prop("checked") && "rtl-mode-switch" === e){
          ($("#light-mode-switch").prop("checked", !1),
          $("#dark-mode-switch").prop("checked", !1),
          $("#bootstrap-style").attr("href", "assets/css/bootstrap-rtl.min.css"),
          $("#app-style").attr("href", "assets/css/app-rtl.min.css"),
          $("html").attr("dir", "rtl"),
          sessionStorage.setItem("is_visited", "rtl-mode-switch"));
      }
  }

}
