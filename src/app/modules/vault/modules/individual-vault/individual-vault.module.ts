import { NgModule } from "@angular/core";

import { VaultModule } from "../../vault.module";

import { IndividualVaultComponent } from "./individual-vault.component";

@NgModule({
  imports: [VaultModule],
  declarations: [IndividualVaultComponent],
  exports: [IndividualVaultComponent],
})
export class IndividualVaultModule {}
