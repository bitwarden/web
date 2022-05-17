import { NgModule } from "@angular/core";

import { VaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";

import { SharedModule } from "../shared.module";

import { CollectionFilterComponent } from "./components/collection-filter.component";
import { FolderFilterComponent } from "./components/folder-filter.component";
import { OrganizationFilterComponent } from "./components/organization-filter.component";
import { OrganizationOptionsComponent } from "./components/organization-options.component";
import { StatusFilterComponent } from "./components/status-filter.component";
import { TypeFilterComponent } from "./components/type-filter.component";
import { VaultFilterComponent } from "./vault-filter.component";

@NgModule({
  imports: [SharedModule],
  declarations: [
    VaultFilterComponent,
    CollectionFilterComponent,
    FolderFilterComponent,
    OrganizationFilterComponent,
    OrganizationOptionsComponent,
    StatusFilterComponent,
    TypeFilterComponent,
  ],
  exports: [VaultFilterComponent],
  providers: [VaultFilterService],
})
export class VaultFilterModule {}
