import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "jslib-angular/services/modal.service";
import { AuditService } from "jslib-common/abstractions/audit.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { Cipher } from "jslib-common/models/domain/cipher";
import { CipherView } from "jslib-common/models/view/cipherView";

import { ExposedPasswordsReportComponent as BaseExposedPasswordsReportComponent } from "../../reports/exposed-passwords-report.component";

@Component({
  selector: "app-org-exposed-passwords-report",
  templateUrl: "../../reports/exposed-passwords-report.component.html",
})
export class ExposedPasswordsReportComponent extends BaseExposedPasswordsReportComponent {
  manageableCiphers: Cipher[];

  constructor(
    cipherService: CipherService,
    auditService: AuditService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(
      cipherService,
      auditService,
      modalService,
      messagingService,
      stateService,
      passwordRepromptService
    );
  }

  ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.manageableCiphers = await this.cipherService.getAll();
      await this.checkAccess();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }

  canManageCipher(c: CipherView): boolean {
    return this.manageableCiphers.some((x) => x.id === c.id);
  }
}
