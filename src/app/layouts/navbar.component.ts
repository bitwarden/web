import { Component, OnInit } from "@angular/core";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { ProviderService } from "jslib-common/abstractions/provider.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { TokenService } from "jslib-common/abstractions/token.service";
import { Provider } from "jslib-common/models/domain/provider";

import { organizationRoutePermissions } from "../oss-routing.module";

@Component({
  selector: "app-navbar",
  templateUrl: "navbar.component.html",
})
export class NavbarComponent implements OnInit {
  selfHosted = false;
  name: string;
  email: string;
  providers: Provider[] = [];
  showOrganizations = false;

  constructor(
    private messagingService: MessagingService,
    private platformUtilsService: PlatformUtilsService,
    private tokenService: TokenService,
    private providerService: ProviderService,
    private syncService: SyncService,
    private organizationService: OrganizationService
  ) {
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    this.name = await this.tokenService.getName();
    this.email = await this.tokenService.getEmail();
    if (this.name == null || this.name.trim() === "") {
      this.name = this.email;
    }

    // Ensure providers and organizations are loaded
    if ((await this.syncService.getLastSync()) == null) {
      await this.syncService.fullSync(false);
    }
    this.providers = await this.providerService.getAll();

    const orgs = await this.organizationService.getAll();
    this.showOrganizations = orgs.some((org) =>
      org.hasAnyPermission(organizationRoutePermissions.all())
    );
  }

  lock() {
    this.messagingService.send("lockVault");
  }

  logOut() {
    this.messagingService.send("logout");
  }
}
