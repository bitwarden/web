import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Permissions } from "jslib-common/enums/permissions";
import { Utils } from "jslib-common/misc/utils";

@Injectable()
export class OrganizationRedirectGuardService implements CanActivate {
  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const orgs = await this.organizationService.getAll();
    const permissions = route.data == null ? null : (route.data.permissions as Permissions[]);

    const allowedOrgs = orgs
      .filter((org) => org.hasAnyPermission(permissions))
      .sort(Utils.getSortFunction(this.i18nService, "name"));

    if (allowedOrgs.length < 1) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));
      this.router.navigate(["/"]);
      return false;
    }

    this.router.navigate(["organizations", allowedOrgs[0].id]);
    return false;
  }
}
