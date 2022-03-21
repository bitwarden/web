import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { BaseGuard } from "jslib-angular/guards/base.guard";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Permissions } from "jslib-common/enums/permissions";

@Injectable()
export class PermissionsGuard extends BaseGuard implements CanActivate {
  constructor(
    protected router: Router,
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {
    super(router);
  }

  async canActivate(route: ActivatedRouteSnapshot) {
    const org = await this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.redirect();
    }

    if (!org.isOwner && !org.enabled) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("organizationIsDisabled")
      );
      return this.redirect();
    }

    const permissions = route.data == null ? null : (route.data.permissions as Permissions[]);
    if (!org.hasAnyPermission(permissions)) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));
      return this.redirect();
    }

    return true;
  }
}
