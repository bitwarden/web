import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { Permissions } from "jslib-common/enums/permissions";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private syncService: SyncService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // TODO: We need to fix this issue once and for all.
    if ((await this.syncService.getLastSync()) == null) {
      await this.syncService.fullSync(false);
    }

    const org = await this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (!org.isOwner && !org.enabled) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("organizationIsDisabled")
      );
      return this.router.createUrlTree(["/"]);
    }

    const permissions = route.data == null ? [] : (route.data.permissions as Permissions[]);
    if (permissions != null && !org.hasAnyPermission(permissions)) {
      // Handle linkable ciphers for organizations the user only has view access to
      // https://bitwarden.atlassian.net/browse/EC-203
      if (state.root.queryParamMap.has("cipherId")) {
        return this.router.createUrlTree(["/vault"], {
          queryParams: {
            cipherId: state.root.queryParamMap.get("cipherId"),
          },
        });
      }

      this.platformUtilsService.showToast("error", null, this.i18nService.t("accessDenied"));
      return this.router.createUrlTree(["/"]);
    }

    return true;
  }
}
