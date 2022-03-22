import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Organization } from "jslib-common/models/domain/organization";

import { NavigationPermissionsService } from "../services/navigation-permissions.service";

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
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
    this.route.params.subscribe(async (params: any) => {
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
    this.organization = await this.organizationService.get(this.organizationId);
  }

  get showManageTab(): boolean {
    return NavigationPermissionsService.canAccessManage(this.organization);
  }

  get showToolsTab(): boolean {
    return NavigationPermissionsService.canAccessTools(this.organization);
  }

  get showSettingsTab(): boolean {
    return NavigationPermissionsService.canAccessSettings(this.organization);
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
