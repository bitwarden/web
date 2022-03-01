import { Component, ViewChild, ViewContainerRef } from "@angular/core";

import { PasswordGeneratorComponent as BasePasswordGeneratorComponent } from "jslib-angular/components/password-generator.component";
import { ModalService } from "jslib-angular/services/modal.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

import { PasswordGeneratorHistoryComponent } from "./password-generator-history.component";

@Component({
  selector: "app-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
  @ViewChild("historyTemplate", { read: ViewContainerRef, static: true })
  historyModalRef: ViewContainerRef;

  constructor(
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    private modalService: ModalService
  ) {
    super(passwordGenerationService, platformUtilsService, i18nService, window);
  }

  async history() {
    await this.modalService.openViewRef(PasswordGeneratorHistoryComponent, this.historyModalRef);
  }

  lengthChanged() {
    document.getElementById("length").focus();
  }

  minNumberChanged() {
    document.getElementById("min-number").focus();
  }

  minSpecialChanged() {
    document.getElementById("min-special").focus();
  }
}
