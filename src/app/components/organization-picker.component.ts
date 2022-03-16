import { Component, Input, OnInit } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Utils } from "jslib-common/misc/utils";
import { Organization } from "jslib-common/models/domain/organization";

import { organizationRoutePermissions } from "../oss-routing.module";

@Component({
  selector: "app-organization-picker",
  templateUrl: "organization-picker.component.html",
})
export class OrganizationPickerComponent implements OnInit {
  constructor(private organizationService: OrganizationService, private i18nService: I18nService) {}

  @Input() activeOrganization: Organization = null;
  organizations: Organization[] = [];

  loaded = false;

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const orgs = await this.organizationService.getAll();
    this.organizations = orgs
      .filter((org) => org.hasAnyPermission(organizationRoutePermissions.all()))
      .sort(Utils.getSortFunction(this.i18nService, "name"));

    this.loaded = true;
  }
}
