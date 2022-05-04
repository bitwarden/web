import { NgModule } from "@angular/core";

import { LooseComponentsModule } from "../loose-components.module";
import { SharedModule } from "../shared.module";
import { VaultFilterModule } from "../vault-filter/vault-filter.module";

import { VaultService } from "./vault.service";

@NgModule({
  imports: [SharedModule, VaultFilterModule, LooseComponentsModule],
  exports: [SharedModule, VaultFilterModule, LooseComponentsModule],
  providers: [
    {
      provide: VaultService,
      useClass: VaultService,
    },
  ],
})
export class VaultModule {}
