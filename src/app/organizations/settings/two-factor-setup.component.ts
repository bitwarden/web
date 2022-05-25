import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TwoFactorProviderType } from "jslib-common/enums/twoFactorProviderType";

import { TwoFactorDuoComponent } from "../../settings/two-factor-duo.component";
import { TwoFactorSetupComponent as BaseTwoFactorSetupComponent } from "../../settings/two-factor-setup.component";

@Component({
  selector: "app-two-factor-setup",
  templateUrl: "../../settings/two-factor-setup.component.html",
})
export class TwoFactorSetupComponent extends BaseTwoFactorSetupComponent {
  constructor(
    apiService: ApiService,
    modalService: ModalService,
    messagingService: MessagingService,
    policyService: PolicyService,
    private route: ActivatedRoute,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    logService: LogService
  ) {
    super(
      apiService,
      modalService,
      messagingService,
      policyService,
      stateService,
      platformUtilsService,
      i18nService,
      logService
    );
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await super.ngOnInit();
    });
  }

  async manage(type: TwoFactorProviderType) {
    switch (type) {
      case TwoFactorProviderType.OrganizationDuo: {
        const duoComp = await this.openModal(this.duoModalRef, TwoFactorDuoComponent);
        duoComp.type = TwoFactorProviderType.OrganizationDuo;
        duoComp.organizationId = this.organizationId;
        duoComp.onUpdated.subscribe((enabled: boolean) => {
          this.updateStatus(enabled, TwoFactorProviderType.OrganizationDuo);
        });
        break;
      }
      default:
        break;
    }
  }

  protected getTwoFactorProviders() {
    return this.apiService.getTwoFactorOrganizationProviders(this.organizationId);
  }

  protected filterProvider(type: TwoFactorProviderType) {
    return type !== TwoFactorProviderType.OrganizationDuo;
  }
}
