import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Permissions } from "jslib-common/enums/permissions";

@Injectable()
export class OrganizationTypeGuardService implements CanActivate {
  constructor(private organizationService: OrganizationService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const org = await this.organizationService.get(route.params.organizationId);
    const permissions = route.data == null ? null : (route.data.permissions as Permissions[]);

    if (org.hasAnyPermission(permissions)) {
      return true;
    }

    this.router.navigate(["/organizations", org.id]);
    return false;
  }
}
