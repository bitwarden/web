import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared.module";

import { EnrollMasterPasswordReset } from "./enroll-master-password-reset.component";

@NgModule({
  imports: [SharedModule, ScrollingModule],
  declarations: [EnrollMasterPasswordReset],
  exports: [EnrollMasterPasswordReset],
})
export class OrganizationUserModule {}
