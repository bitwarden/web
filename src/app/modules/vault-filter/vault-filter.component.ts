import { Component, EventEmitter, Input, Output } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "jslib-angular/modules/vault-filter/vault-filter.component";
import { VaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  @Input() showOrgFilter = true;
  @Input() showFolders = true;
  @Input() showFavorites = true;

  @Output() onSearchTextChanged = new EventEmitter<string>();

  searchPlaceholder: string;
  searchText = "";

  organization: Organization;

  constructor(vaultFilterService: VaultFilterService) {
    super(vaultFilterService);
  }

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }

  // This method exists because the vault component gets its data mixed up during the initial sync on first login. It looks for data before the sync is complete.
  // It should be removed as soon as doing so makes sense.
  async reloadOrganizations() {
    this.organizations = await this.vaultFilterService.buildOrganizations();
  }
}
