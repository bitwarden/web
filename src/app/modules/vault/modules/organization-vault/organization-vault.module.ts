import { NgModule } from "@angular/core";

import { VaultModule } from "../../vault.module";

import { OrganizationVaultComponent } from "./organization-vault.component";

@NgModule({
  imports: [VaultModule],
  declarations: [OrganizationVaultComponent],
  exports: [OrganizationVaultComponent],
})
export class OrganizationVaultModule {}
