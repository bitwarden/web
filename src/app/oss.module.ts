import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "./modules/loose-components.module";
import { SharedModule } from "./modules/shared.module";
import { VaultFilterModule } from "./modules/vault-filter/vault-filter.module";

@NgModule({
  imports: [SharedModule, LooseComponentsModule, VaultFilterModule],
  exports: [LooseComponentsModule, VaultFilterModule],
  bootstrap: [],
})
export class OssModule {}
