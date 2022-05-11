import { NgModule } from "@angular/core";

import { VaultModule } from "../../vault.module";

import { AddEditComponent } from "./add-edit.component";
import { AttachmentsComponent } from "./attachments.component";
import { CiphersComponent } from "./ciphers.component";
import { CollectionsComponent } from "./collections.component";
import { OrganizationVaultRoutingModule } from "./organization-vault-routing.module";
import { OrganizationVaultComponent } from "./organization-vault.component";

@NgModule({
  imports: [VaultModule, OrganizationVaultRoutingModule],
  declarations: [
    OrganizationVaultComponent,
    AddEditComponent,
    AttachmentsComponent,
    CiphersComponent,
    CollectionsComponent,
  ],
  exports: [OrganizationVaultComponent],
})
export class OrganizationVaultModule {}
