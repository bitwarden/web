import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../modules/shared.module";

import { DisableSendPolicyComponent } from "./disable-send.component";
import { MasterPasswordPolicyComponent } from "./master-password.component";
import { PasswordGeneratorPolicyComponent } from "./password-generator.component";
import { PersonalOwnershipPolicyComponent } from "./personal-ownership.component";
import { PoliciesComponent } from "./policies.component";
import { RequireSsoPolicyComponent } from "./require-sso.component";
import { ResetPasswordPolicyComponent } from "./reset-password.component";
import { SendOptionsPolicyComponent } from "./send-options.component";
import { SingleOrgPolicyComponent } from "./single-org.component";
import { TwoFactorAuthenticationPolicyComponent } from "./two-factor-authentication.component";

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    DisableSendPolicyComponent,
    MasterPasswordPolicyComponent,
    PasswordGeneratorPolicyComponent,
    PersonalOwnershipPolicyComponent,
    RequireSsoPolicyComponent,
    ResetPasswordPolicyComponent,
    SendOptionsPolicyComponent,
    SingleOrgPolicyComponent,
    TwoFactorAuthenticationPolicyComponent,
    PoliciesComponent,
  ],
})
export class PoliciesModule {}
