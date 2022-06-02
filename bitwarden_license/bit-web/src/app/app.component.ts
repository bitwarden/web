import { Component } from "@angular/core";

import { AppComponent as BaseAppComponent } from "src/app/app.component";

import { DisablePersonalVaultExportPolicy } from "./policies/disable-personal-vault-export.component";
import { MaximumVaultTimeoutPolicy } from "./policies/maximum-vault-timeout.component";

@Component({
  selector: "app-root",
  templateUrl: "../../../src/app/app.component.html",
})
export class AppComponent extends BaseAppComponent {
  ngOnInit() {
    super.ngOnInit();

    this.policyListService.addPolicies([
      new MaximumVaultTimeoutPolicy(),
      new DisablePersonalVaultExportPolicy(),
    ]);
  }
}
