import { Component } from "@angular/core";

import { BaseAcceptComponent } from "src/app/common/base.accept.component";

@Component({
  selector: "app-accept-family-sponsorship",
  templateUrl: "accept-family-sponsorship.component.html",
})
export class AcceptFamilySponsorshipComponent extends BaseAcceptComponent {
  failedShortMessage = "inviteAcceptFailedShort";
  failedMessage = "inviteAcceptFailed";

  requiredParameters = ["email", "token"];

  async authedHandler(qParams: any) {
    this.router.navigate(["/setup/families-for-enterprise"], { queryParams: qParams });
  }

  async unauthedHandler(qParams: any) {
    if (!qParams.register) {
      this.router.navigate(["/login"], { queryParams: { email: qParams.email } });
    } else {
      this.router.navigate(["/register"], { queryParams: { email: qParams.email } });
    }
  }
}
