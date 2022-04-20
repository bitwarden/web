import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "./modules/loose-components.module";
import { SharedModule } from "./modules/shared.module";
import { VaultFilterModule } from "./modules/vault-filter/vault-filter.module";
import { IndividualVaultModule } from "./modules/vault/modules/individual-vault/individual-vault.module";
import { OrganizationVaultModule } from "./modules/vault/modules/organization-vault/organization-vault.module";

@NgModule({
  imports: [
    SharedModule,
    LooseComponentsModule,
    IndividualVaultModule,
    OrganizationVaultModule,
    VaultFilterModule,
  ],
  exports: [
    LooseComponentsModule,
    IndividualVaultModule,
    OrganizationVaultModule,
    VaultFilterModule,
  ],
  bootstrap: [],
})
export class OssModule {}
