import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Injectable()
export class OrganizationGuardService implements CanActivate {
    constructor(
        private router: Router,
        private platformUtilsService: PlatformUtilsService,
        private i18nService: I18nService,
        private organizationService: OrganizationService
    ) {}

    async canActivate(route: ActivatedRouteSnapshot) {
        const org = await this.organizationService.get(route.params.organizationId);
        if (org == null) {
            this.router.navigate(["/"]);
            return false;
        }
        if (!org.isOwner && !org.enabled) {
            this.platformUtilsService.showToast("error", null, this.i18nService.t("organizationIsDisabled"));
            this.router.navigate(["/"]);
            return false;
        }

        return true;
    }
}
