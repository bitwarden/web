import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "jslib-angular/services/modal.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CipherView } from "jslib-common/models/view/cipherView";

import { InactiveTwoFactorReportComponent as BaseInactiveTwoFactorReportComponent } from "../../reports/inactive-two-factor-report.component";

@Component({
  selector: "app-inactive-two-factor-report",
  templateUrl: "../../reports/inactive-two-factor-report.component.html",
})
export class InactiveTwoFactorReportComponent extends BaseInactiveTwoFactorReportComponent {
  constructor(
    cipherService: CipherService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    private route: ActivatedRoute,
    logService: LogService,
    passwordRepromptService: PasswordRepromptService,
    private organizationService: OrganizationService
  ) {
    super(
      cipherService,
      modalService,
      messagingService,
      stateService,
      logService,
      passwordRepromptService
    );
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      await super.ngOnInit();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }
}
