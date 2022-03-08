import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-organization-picker",
  templateUrl: "organization-picker.component.html",
})
export class OrganizationPickerComponent {
  @Input() organization: Organization;
}
