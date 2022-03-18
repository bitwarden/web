import { Component, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { StateService } from "jslib-common/abstractions/state.service";

import { DeauthorizeSessionsComponent } from "./deauthorize-sessions.component";
import { DeleteAccountComponent } from "./delete-account.component";
import { PurgeVaultComponent } from "./purge-vault.component";

@Component({
  selector: "app-account",
  templateUrl: "account.component.html",
})
export class AccountComponent {
  @ViewChild("deauthorizeSessionsTemplate", { read: ViewContainerRef, static: true })
  deauthModalRef: ViewContainerRef;
  @ViewChild("purgeVaultTemplate", { read: ViewContainerRef, static: true })
  purgeModalRef: ViewContainerRef;
  @ViewChild("deleteAccountTemplate", { read: ViewContainerRef, static: true })
  deleteModalRef: ViewContainerRef;

  showChangeEmail = true;

  constructor(
    private modalService: ModalService,
    private apiService: ApiService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    this.showChangeEmail = !(await this.keyConnectorService.getUsesKeyConnector());
  }

  async deauthorizeSessions() {
    await this.modalService.openViewRef(DeauthorizeSessionsComponent, this.deauthModalRef);
  }

  async purgeVault() {
    await this.modalService.openViewRef(PurgeVaultComponent, this.purgeModalRef);
  }

  async deleteAccount() {
    await this.modalService.openViewRef(DeleteAccountComponent, this.deleteModalRef);
  }
}
