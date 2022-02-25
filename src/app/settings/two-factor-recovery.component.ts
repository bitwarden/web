import { Component } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { TwoFactorProviderType } from "jslib-common/enums/twoFactorProviderType";
import { TwoFactorRecoverResponse } from "jslib-common/models/response/twoFactorRescoverResponse";

@Component({
  selector: "app-two-factor-recovery",
  templateUrl: "two-factor-recovery.component.html",
})
export class TwoFactorRecoveryComponent {
  type = -1;
  code: string;
  authed: boolean;
  twoFactorProviderType = TwoFactorProviderType;

  constructor(private i18nService: I18nService) {}

  auth(authResponse: any) {
    this.authed = true;
    this.processResponse(authResponse.response);
  }

  print() {
    const w = window.open();
    w.document.write(
      '<div style="font-size: 18px; text-align: center;">' +
        "<p>" +
        this.i18nService.t("twoFactorRecoveryYourCode") +
        ":</p>" +
        "<code style=\"font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;\">" +
        this.code +
        "</code></div>" +
        '<p style="text-align: center;">' +
        new Date() +
        "</p>"
    );
    w.onafterprint = () => w.close();
    w.print();
  }

  private formatString(s: string) {
    if (s == null) {
      return null;
    }
    return s
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .toUpperCase();
  }

  private processResponse(response: TwoFactorRecoverResponse) {
    this.code = this.formatString(response.code);
  }
}
