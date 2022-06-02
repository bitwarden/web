import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { GeneratorComponent as BaseGeneratorComponent } from "jslib-angular/components/generator.component";
import { ModalService } from "jslib-angular/services/modal.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { UsernameGenerationService } from "jslib-common/abstractions/usernameGeneration.service";

import { PasswordGeneratorHistoryComponent } from "./password-generator-history.component";

@Component({
  selector: "app-generator",
  templateUrl: "generator.component.html",
})
export class GeneratorComponent extends BaseGeneratorComponent {
  @ViewChild("historyTemplate", { read: ViewContainerRef, static: true })
  historyModalRef: ViewContainerRef;

  constructor(
    passwordGenerationService: PasswordGenerationService,
    usernameGenerationService: UsernameGenerationService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    logService: LogService,
    route: ActivatedRoute,
    private modalService: ModalService
  ) {
    super(
      passwordGenerationService,
      usernameGenerationService,
      platformUtilsService,
      stateService,
      i18nService,
      logService,
      route,
      window
    );
    if (platformUtilsService.isSelfHost()) {
      // Cannot use Firefox Relay on self hosted web vaults due to CORS issues with Firefox Relay API
      this.forwardOptions.splice(
        this.forwardOptions.findIndex((o) => o.value === "firefoxrelay"),
        1
      );
    }
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
