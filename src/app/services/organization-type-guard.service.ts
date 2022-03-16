import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Permissions } from "jslib-common/enums/permissions";

@Injectable()
export class OrganizationPermissionsGuardService implements CanActivate {
  constructor(
    private organizationService: OrganizationService,
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const org = await this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.cancelNavigation();
    }

    const permissions = route.data == null ? null : (route.data.permissions as Permissions[]);
    if (!org.hasAnyPermission(permissions)) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));

      return this.cancelNavigation();
    }

    return true;
  }

  private cancelNavigation() {
    this.router.navigate(["vault"]);
    return false;
  }
}
