import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Utils } from "jslib-common/misc/utils";

@Injectable()
export class OrganizationGuardService implements CanActivate {
  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    if (route.params.organizationId == null) {
      const allOrgs = await this.organizationService.getAll();
      const adminOrgs = allOrgs.filter((org) => org.isAdmin);
      if (adminOrgs.length < 1) {
        return this.cancelNavigation();
      }
      const sortedOrgs = adminOrgs.sort(Utils.getSortFunction(this.i18nService, "name"));
      this.router.navigate(["/organizations", sortedOrgs[0].id]);
      return false;
    }

    const org = await this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.cancelNavigation();
    }

    if (!org.isAdmin) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("accessDenied"),
        this.i18nService.t("accessDeniedAdminRequired")
      );
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

    return true;
  }

  private cancelNavigation() {
    this.router.navigate(["/"]);
    return false;
  }
}
