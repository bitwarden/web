import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Utils } from "jslib-common/misc/utils";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-organization-picker",
  templateUrl: "organization-picker.component.html",
})
export class OrganizationPickerComponent implements OnInit {
  constructor(
    private organizationService: OrganizationService,
    private i18nService: I18nService,
    private route: ActivatedRoute
  ) {}

  activeOrganizationId: string;
  organizations: Organization[] = [];

  collapsed = true;
  loaded = false;

  get activeOrganization() {
    return this.organizations.find((org) => org.id == this.activeOrganizationId);
  }

  async ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      this.activeOrganizationId = params.organizationId;
      await this.load();
    });
  }

  async load() {
    const orgs = await this.organizationService.getAll();
    this.organizations = orgs
      .filter((org) => org.canAccessAdminView)
      .sort(Utils.getSortFunction(this.i18nService, "name"));

    this.loaded = true;
  }
}
