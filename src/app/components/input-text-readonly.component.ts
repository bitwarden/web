import { Component, Input } from "@angular/core";

import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-input-text-readonly",
  templateUrl: "input-text-readonly.component.html",
})
export class InputTextReadOnly {
  @Input() controlValue: string;
  @Input() label: string;
  @Input() showCopy: boolean = true;
  @Input() showLaunch: boolean = false;

  constructor(private platformUtilsService: PlatformUtilsService) {}

  copy(value: string) {
    this.platformUtilsService.copyToClipboard(value);
  }

  launchUri(url: string) {
    this.platformUtilsService.launchUri(url);
  }
}
