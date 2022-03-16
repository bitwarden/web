import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Utils } from "jslib-common/misc/utils";
import { Organization } from "jslib-common/models/domain/organization";

import { organizationRoutePermissions } from "../oss-routing.module";

const BroadcasterSubscriptionId = "OrganizationLayoutComponent";

@Component({
  selector: "app-organization-layout",
  templateUrl: "organization-layout.component.html",
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
  organization: Organization;
  businessTokenPromise: Promise<any>;
  private organizationId: string;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private i18nService: I18nService,
    private router: Router
  ) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    this.route.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
    });
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "updatedOrgLicense":
            await this.load();
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    if (this.organizationId != null) {
      this.organization = await this.organizationService.get(this.organizationId);
    } else {
      const orgs = await this.organizationService.getAll();
      const allowedOrgs = orgs
        .filter((org) => org.isAdmin)
        .sort(Utils.getSortFunction(this.i18nService, "name"));
      this.router.navigate(["organizations", allowedOrgs[0].id]);
    }
  }

  get showManageTab(): boolean {
    return this.organization.hasAnyPermission(organizationRoutePermissions.manage);
  }

  get showToolsTab(): boolean {
    return this.organization.hasAnyPermission(organizationRoutePermissions.tools);
  }

  get showSettingsTab(): boolean {
    return this.organization.hasAnyPermission(organizationRoutePermissions.settings);
  }

  get toolsRoute(): string {
    return this.organization.canAccessImportExport
      ? "tools/import"
      : "tools/exposed-passwords-report";
  }

  get manageRoute(): string {
    let route: string;
    switch (true) {
      case this.organization.canManageUsers:
        route = "manage/people";
        break;
      case this.organization.canViewAssignedCollections || this.organization.canViewAllCollections:
        route = "manage/collections";
        break;
      case this.organization.canManageGroups:
        route = "manage/groups";
        break;
      case this.organization.canManagePolicies:
        route = "manage/policies";
        break;
      case this.organization.canAccessEventLogs:
        route = "manage/events";
        break;
    }
    return route;
  }
}
