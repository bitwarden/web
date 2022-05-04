import { NgModule } from "@angular/core";

import { VaultModule } from "../../vault.module";

import { IndividualVaultRoutingModule } from "./individual-vault-routing.module";
import { IndividualVaultComponent } from "./individual-vault.component";

@NgModule({
  imports: [VaultModule, IndividualVaultRoutingModule],
  declarations: [IndividualVaultComponent],
  exports: [IndividualVaultComponent],
})
export class IndividualVaultModule {}
