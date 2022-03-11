import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";

@Component({
  selector: "app-security",
  templateUrl: "security.component.html",
})
export class SecurityComponent implements OnInit {
  showChangePassword = true;

  constructor(
    private keyConnectorService: KeyConnectorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.showChangePassword = !(await this.keyConnectorService.getUsesKeyConnector());
    if (!this.showChangePassword) {
      this.router.navigate(["/settings/security/two-factor"]);
    }
  }
}
