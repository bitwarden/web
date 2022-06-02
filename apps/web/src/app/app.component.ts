import { Component, NgZone, OnDestroy, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import * as jq from "jquery";
import { IndividualConfig, ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";

import { AuthService } from "jslib-common/abstractions/auth.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { NotificationsService } from "jslib-common/abstractions/notifications.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { SettingsService } from "jslib-common/abstractions/settings.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { TokenService } from "jslib-common/abstractions/token.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";

import { DisableSendPolicy } from "./organizations/policies/disable-send.component";
import { MasterPasswordPolicy } from "./organizations/policies/master-password.component";
import { PasswordGeneratorPolicy } from "./organizations/policies/password-generator.component";
import { PersonalOwnershipPolicy } from "./organizations/policies/personal-ownership.component";
import { RequireSsoPolicy } from "./organizations/policies/require-sso.component";
import { ResetPasswordPolicy } from "./organizations/policies/reset-password.component";
import { SendOptionsPolicy } from "./organizations/policies/send-options.component";
import { SingleOrgPolicy } from "./organizations/policies/single-org.component";
import { TwoFactorAuthenticationPolicy } from "./organizations/policies/two-factor-authentication.component";
import { PolicyListService } from "./services/policy-list.service";
import { RouterService } from "./services/router.service";

const BroadcasterSubscriptionId = "AppComponent";
const IdleTimeout = 60000 * 10; // 10 minutes

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
})
export class AppComponent implements OnDestroy, OnInit {
  private lastActivity: number = null;
  private idleTimer: number = null;
  private isIdle = false;

  constructor(
    private broadcasterService: BroadcasterService,
    private tokenService: TokenService,
    private folderService: FolderService,
    private settingsService: SettingsService,
    private syncService: SyncService,
    private passwordGenerationService: PasswordGenerationService,
    private cipherService: CipherService,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private ngZone: NgZone,
    private vaultTimeoutService: VaultTimeoutService,
    private cryptoService: CryptoService,
    private collectionService: CollectionService,
    private sanitizer: DomSanitizer,
    private searchService: SearchService,
    private notificationsService: NotificationsService,
    private routerService: RouterService,
    private stateService: StateService,
    private eventService: EventService,
    private policyService: PolicyService,
    protected policyListService: PolicyListService,
    private keyConnectorService: KeyConnectorService
  ) {}

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      window.onmousemove = () => this.recordActivity();
      window.onmousedown = () => this.recordActivity();
      window.ontouchstart = () => this.recordActivity();
      window.onclick = () => this.recordActivity();
      window.onscroll = () => this.recordActivity();
      window.onkeypress = () => this.recordActivity();
    });

    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "loggedIn":
            this.notificationsService.updateConnection(false);
            break;
          case "loggedOut":
            this.routerService.setPreviousUrl(null);
            this.notificationsService.updateConnection(false);
            break;
          case "unlocked":
            this.notificationsService.updateConnection(false);
            break;
          case "authBlocked":
            this.routerService.setPreviousUrl(message.url);
            this.router.navigate(["/"]);
            break;
          case "logout":
            this.logOut(!!message.expired);
            break;
          case "lockVault":
            await this.vaultTimeoutService.lock();
            break;
          case "locked":
            this.notificationsService.updateConnection(false);
            this.router.navigate(["lock"]);
            break;
          case "lockedUrl":
            this.routerService.setPreviousUrl(message.url);
            break;
          case "syncStarted":
            break;
          case "syncCompleted":
            break;
          case "upgradeOrganization": {
            const upgradeConfirmed = await this.platformUtilsService.showDialog(
              this.i18nService.t("upgradeOrganizationDesc"),
              this.i18nService.t("upgradeOrganization"),
              this.i18nService.t("upgradeOrganization"),
              this.i18nService.t("cancel")
            );
            if (upgradeConfirmed) {
              this.router.navigate([
                "organizations",
                message.organizationId,
                "settings",
                "billing",
              ]);
            }
            break;
          }
          case "premiumRequired": {
            const premiumConfirmed = await this.platformUtilsService.showDialog(
              this.i18nService.t("premiumRequiredDesc"),
              this.i18nService.t("premiumRequired"),
              this.i18nService.t("learnMore"),
              this.i18nService.t("cancel")
            );
            if (premiumConfirmed) {
              this.router.navigate(["settings/premium"]);
            }
            break;
          }
          case "emailVerificationRequired": {
            const emailVerificationConfirmed = await this.platformUtilsService.showDialog(
              this.i18nService.t("emailVerificationRequiredDesc"),
              this.i18nService.t("emailVerificationRequired"),
              this.i18nService.t("learnMore"),
              this.i18nService.t("cancel")
            );
            if (emailVerificationConfirmed) {
              this.platformUtilsService.launchUri(
                "https://bitwarden.com/help/create-bitwarden-account/"
              );
            }
            break;
          }
          case "showToast":
            this.showToast(message);
            break;
          case "setFullWidth":
            this.setFullWidth();
            break;
          case "convertAccountToKeyConnector":
            this.router.navigate(["/remove-password"]);
            break;
          default:
            break;
        }
      });
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const modals = Array.from(document.querySelectorAll(".modal"));
        for (const modal of modals) {
          (jq(modal) as any).modal("hide");
        }

        if (document.querySelector(".swal-modal") != null) {
          Swal.close(undefined);
        }
      }
    });

    this.policyListService.addPolicies([
      new TwoFactorAuthenticationPolicy(),
      new MasterPasswordPolicy(),
      new PasswordGeneratorPolicy(),
      new SingleOrgPolicy(),
      new RequireSsoPolicy(),
      new PersonalOwnershipPolicy(),
      new DisableSendPolicy(),
      new SendOptionsPolicy(),
      new ResetPasswordPolicy(),
    ]);

    this.setFullWidth();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  private async logOut(expired: boolean) {
    await this.eventService.uploadEvents();
    const userId = await this.stateService.getUserId();
    await Promise.all([
      this.eventService.clearEvents(),
      this.syncService.setLastSync(new Date(0)),
      this.cryptoService.clearKeys(),
      this.settingsService.clear(userId),
      this.cipherService.clear(userId),
      this.folderService.clear(userId),
      this.collectionService.clear(userId),
      this.policyService.clear(userId),
      this.passwordGenerationService.clear(),
      this.keyConnectorService.clear(),
    ]);

    this.searchService.clearIndex();
    this.authService.logOut(async () => {
      if (expired) {
        this.platformUtilsService.showToast(
          "warning",
          this.i18nService.t("loggedOut"),
          this.i18nService.t("loginExpired")
        );
      }

      await this.stateService.clean({ userId: userId });
      Swal.close();
      this.router.navigate(["/"]);
    });
  }

  private async recordActivity() {
    const now = new Date().getTime();
    if (this.lastActivity != null && now - this.lastActivity < 250) {
      return;
    }

    this.lastActivity = now;
    this.stateService.setLastActive(now);
    // Idle states
    if (this.isIdle) {
      this.isIdle = false;
      this.idleStateChanged();
    }
    if (this.idleTimer != null) {
      window.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.idleTimer = window.setTimeout(() => {
      if (!this.isIdle) {
        this.isIdle = true;
        this.idleStateChanged();
      }
    }, IdleTimeout);
  }

  private showToast(msg: any) {
    let message = "";

    const options: Partial<IndividualConfig> = {};

    if (typeof msg.text === "string") {
      message = msg.text;
    } else if (msg.text.length === 1) {
      message = msg.text[0];
    } else {
      msg.text.forEach(
        (t: string) =>
          (message += "<p>" + this.sanitizer.sanitize(SecurityContext.HTML, t) + "</p>")
      );
      options.enableHtml = true;
    }
    if (msg.options != null) {
      if (msg.options.trustedHtml === true) {
        options.enableHtml = true;
      }
      if (msg.options.timeout != null && msg.options.timeout > 0) {
        options.timeOut = msg.options.timeout;
      }
    }

    this.toastrService.show(message, msg.title, options, "toast-" + msg.type);
  }

  private idleStateChanged() {
    if (this.isIdle) {
      this.notificationsService.disconnectFromInactivity();
    } else {
      this.notificationsService.reconnectFromActivity();
    }
  }

  private async setFullWidth() {
    const enableFullWidth = await this.stateService.getEnableFullWidth();
    if (enableFullWidth) {
      document.body.classList.add("full-width");
    } else {
      document.body.classList.remove("full-width");
    }
  }
}
