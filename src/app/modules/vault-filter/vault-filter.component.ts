import { Component, EventEmitter, Output } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "jslib-angular/modules/vault-filter/vault-filter.component";

import { VaultFilterService } from "./vault-filter.service";

@Component({
  selector: "app-vault-filter",
  templateUrl: "vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  @Output() onSearchTextChanged = new EventEmitter<string>();

  searchPlaceholder: string;
  searchText = "";

  constructor(protected vaultFilterService: VaultFilterService) {
    // This empty constructor is required to provide the web vaultFilterService subclass to super()
    // TODO: refactor this to use proper dependency injection
    super(vaultFilterService);
  }

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }

  // This method exists because the vault component gets its data mixed up during the initial sync on first login. It looks for data before the sync is complete.
  // It should be removed as soon as doing so makes sense.
  async reloadOrganizations() {
    this.organizations = await this.vaultFilterService.buildOrganizations();
    this.activePersonalOwnershipPolicy =
      await this.vaultFilterService.checkForPersonalOwnershipPolicy();
    this.activeSingleOrganizationPolicy =
      await this.vaultFilterService.checkForSingleOrganizationPolicy();
  }
}
