import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "./modules/loose-components.module";
import { PipesModule } from "./modules/pipes/pipes.module";
import { SharedModule } from "./modules/shared.module";
import { VaultFilterModule } from "./modules/vault-filter/vault-filter.module";
import { IndividualVaultModule } from "./modules/vault/modules/individual-vault/individual-vault.module";
import { OrganizationBadgeModule } from "./modules/vault/modules/organization-badge/organization-badge.module";
import { OrganizationVaultModule } from "./modules/vault/modules/organization-vault/organization-vault.module";

@NgModule({
  imports: [
    SharedModule,
    LooseComponentsModule,
    IndividualVaultModule,
    OrganizationVaultModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    PipesModule,
  ],
  exports: [
    LooseComponentsModule,
    IndividualVaultModule,
    OrganizationVaultModule,
    VaultFilterModule,
    OrganizationBadgeModule,
    PipesModule,
  ],
  bootstrap: [],
})
export class OssModule {}
