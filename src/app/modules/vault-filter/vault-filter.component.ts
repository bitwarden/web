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
    super(vaultFilterService);
  }

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }
}
