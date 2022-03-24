import { Component, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { StateService } from "jslib-common/abstractions/state.service";

import { ApiKeyComponent } from "./api-key.component";
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
  @ViewChild("viewUserApiKeyTemplate", { read: ViewContainerRef, static: true })
  viewUserApiKeyModalRef: ViewContainerRef;
  @ViewChild("rotateUserApiKeyTemplate", { read: ViewContainerRef, static: true })
  rotateUserApiKeyModalRef: ViewContainerRef;

  showChangePassword = true;
  showChangeKdf = true;
  showChangeEmail = true;

  constructor(
    private modalService: ModalService,
    private apiService: ApiService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    this.showChangeEmail =
      this.showChangeKdf =
      this.showChangePassword =
        !(await this.keyConnectorService.getUsesKeyConnector());
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

  async viewUserApiKey() {
    const entityId = await this.stateService.getUserId();
    await this.modalService.openViewRef(ApiKeyComponent, this.viewUserApiKeyModalRef, (comp) => {
      comp.keyType = "user";
      comp.entityId = entityId;
      comp.postKey = this.apiService.postUserApiKey.bind(this.apiService);
      comp.scope = "api";
      comp.grantType = "client_credentials";
      comp.apiKeyTitle = "apiKey";
      comp.apiKeyWarning = "userApiKeyWarning";
      comp.apiKeyDescription = "userApiKeyDesc";
    });
  }

  async rotateUserApiKey() {
    const entityId = await this.stateService.getUserId();
    await this.modalService.openViewRef(ApiKeyComponent, this.rotateUserApiKeyModalRef, (comp) => {
      comp.keyType = "user";
      comp.isRotation = true;
      comp.entityId = entityId;
      comp.postKey = this.apiService.postUserRotateApiKey.bind(this.apiService);
      comp.scope = "api";
      comp.grantType = "client_credentials";
      comp.apiKeyTitle = "apiKey";
      comp.apiKeyWarning = "userApiKeyWarning";
      comp.apiKeyDescription = "apiKeyRotateDesc";
    });
  }
}
