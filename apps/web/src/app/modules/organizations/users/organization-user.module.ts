import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "../../loose-components.module";
import { SharedModule } from "../../shared.module";

import { EnrollMasterPasswordReset } from "./enroll-master-password-reset.component";

@NgModule({
  imports: [SharedModule, ScrollingModule, LooseComponentsModule],
  declarations: [EnrollMasterPasswordReset],
  exports: [EnrollMasterPasswordReset],
})
export class OrganizationUserModule {}
