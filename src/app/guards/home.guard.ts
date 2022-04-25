import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { StateService } from "jslib-common/abstractions/state.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";

@Injectable()
export class HomeGuard implements CanActivate {
  constructor(
    private vaultTimeoutService: VaultTimeoutService,
    private router: Router,
    private stateService: StateService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    if (!(await this.stateService.getIsAuthenticated())) {
      return this.router.createUrlTree(["/login"], { queryParams: route.queryParams });
    }
    if (await this.vaultTimeoutService.isLocked()) {
      return this.router.createUrlTree(["/lock"], { queryParams: route.queryParams });
    }
    return this.router.createUrlTree(["/vault"], { queryParams: route.queryParams });
  }
}
