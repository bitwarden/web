import { NgModule } from "@angular/core";

import { SharedModule } from "../shared.module";

import { CollectionFilterComponent } from "./components/collection-filter.component";
import { FolderFilterComponent } from "./components/folder-filter.component";
import { LinkSsoComponent } from "./components/link-sso.component";
import { OrganizationFilterComponent } from "./components/organization-filter.component";
import { OrganizationOptionsComponent } from "./components/organization-options.component";
import { StatusFilterComponent } from "./components/status-filter.component";
import { TypeFilterComponent } from "./components/type-filter.component";
import { OrganizationVaultFilterComponent } from "./organization-vault-filter.component";
import { VaultFilterComponent } from "./vault-filter.component";
import { VaultFilterService } from "./vault-filter.service";

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
    OrganizationVaultFilterComponent,
    LinkSsoComponent,
  ],
  exports: [VaultFilterComponent, OrganizationVaultFilterComponent],
  providers: [VaultFilterService],
})
export class VaultFilterModule {}
