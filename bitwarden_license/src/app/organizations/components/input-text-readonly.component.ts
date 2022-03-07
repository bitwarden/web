import { Component, Input } from "@angular/core";

import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

/** For use in the SSO Config Form only - will be deprecated by the Component Library */
@Component({
  selector: "app-input-text-readonly",
  templateUrl: "input-text-readonly.component.html",
})
export class InputTextReadOnlyComponent {
  @Input() controlValue: string;
  @Input() label: string;
  @Input() showCopy = true;
  @Input() showLaunch = false;

  constructor(private platformUtilsService: PlatformUtilsService) {}

  copy(value: string) {
    this.platformUtilsService.copyToClipboard(value);
  }

  launchUri(url: string) {
    this.platformUtilsService.launchUri(url);
  }
}
