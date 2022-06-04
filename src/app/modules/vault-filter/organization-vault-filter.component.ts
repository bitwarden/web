import { Component, Input } from "@angular/core";

import { Organization } from "jslib-common/models/domain/organization";

import { VaultFilterComponent } from "./vault-filter.component";

@Component({
  selector: "app-organization-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class OrganizationVaultFilterComponent extends VaultFilterComponent {
  @Input() hideOrganizations = true;
  @Input() hideFavorites = true;
  @Input() hideFolders = true;

  organization: Organization;

  async initCollections() {
    if (this.organization.canEditAnyCollection) {
      return await this.vaultFilterService.buildAdminCollections(this.organization.id);
    }
    return await this.vaultFilterService.buildCollections(this.organization.id);
  }

  async reloadCollectionsAndFolders() {
    this.collections = await this.initCollections();
  }
}
