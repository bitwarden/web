import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ModalService } from "jslib-angular/services/modal.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { Cipher } from "jslib-common/models/domain/cipher";
import { CipherView } from "jslib-common/models/view/cipherView";

import { WeakPasswordsReportComponent as BaseWeakPasswordsReportComponent } from "../../reports/weak-passwords-report.component";

@Component({
  selector: "app-weak-passwords-report",
  templateUrl: "../../reports/weak-passwords-report.component.html",
})
export class WeakPasswordsReportComponent extends BaseWeakPasswordsReportComponent {
  manageableCiphers: Cipher[];

  constructor(
    cipherService: CipherService,
    passwordGenerationService: PasswordGenerationService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(
      cipherService,
      passwordGenerationService,
      modalService,
      messagingService,
      stateService,
      passwordRepromptService
    );
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.manageableCiphers = await this.cipherService.getAll();
      await super.ngOnInit();
    });
  }

  getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllFromApiForOrganization(this.organization.id);
  }

  canManageCipher(c: CipherView): boolean {
    return this.manageableCiphers.some((x) => x.id === c.id);
  }
}
