import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-user-layout",
  templateUrl: "user-layout.component.html",
})
export class UserLayoutComponent implements OnInit {
  ngOnInit() {
    document.body.classList.remove("layout_frontend");
  }
}
