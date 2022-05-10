import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { StateService } from "jslib-common/abstractions/state.service";

import { ApiKeyComponent } from "./api-key.component";

@Component({
  selector: "app-security-keys",
  templateUrl: "security-keys.component.html",
})
export class SecurityKeysComponent implements OnInit {
  @ViewChild("viewUserApiKeyTemplate", { read: ViewContainerRef, static: true })
  viewUserApiKeyModalRef: ViewContainerRef;
  @ViewChild("rotateUserApiKeyTemplate", { read: ViewContainerRef, static: true })
  rotateUserApiKeyModalRef: ViewContainerRef;

  showChangeKdf = true;

  constructor(
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService,
    private modalService: ModalService,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    this.showChangeKdf = !(await this.keyConnectorService.getUsesKeyConnector());
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
