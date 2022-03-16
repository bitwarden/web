import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

import { organizationRoutePermissions } from "../oss-routing.module";

@Injectable()
export class OrganizationGuardService implements CanActivate {
  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const organizationId = route.params.organizationId;
    if (organizationId != null) {
      return this.canActivateOrganization(organizationId);
    } else {
      return this.canActivateAnyOrganization();
    }
  }

  private async canActivateOrganization(organizationId: string) {
    const org = await this.organizationService.get(organizationId);
    if (org == null) {
      return this.cancelNavigation();
    }

    if (!org.isOwner && !org.enabled) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("organizationIsDisabled")
      );
      return this.cancelNavigation();
    }

    if (!org.canAccessAdminView) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("accessDenied"),
        this.i18nService.t("accessDeniedOrganization")
      );
      return this.cancelNavigation();
    }
    return true;
  }

  private async canActivateAnyOrganization() {
    const allOrgs = await this.organizationService.getAll();
    const adminOrgs = allOrgs.filter((org) => org.canAccessAdminView);
    if (adminOrgs.length < 1) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("accessDenied"),
        this.i18nService.t("accessDeniedAnyOrganization")
      );
      return this.cancelNavigation();
    }
    return true;
  }

  private cancelNavigation() {
    this.router.navigate(["/"]);
    return false;
  }
}
