import { Component } from "@angular/core";

import { OrganizationFilterComponent as BaseOrganizationFilterComponent } from "jslib-angular/modules/vault-filter/components/organization-filter.component";

@Component({
  selector: "app-organization-filter",
  templateUrl: "organization-filter.component.html",
})
export class OrganizationFilterComponent extends BaseOrganizationFilterComponent {
  displayText = "allVaults";
}
