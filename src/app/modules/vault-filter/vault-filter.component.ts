import { Component, EventEmitter, Input, Output } from "@angular/core";

import { VaultFilterComponent as BaseVaultFilterComponent } from "jslib-angular/modules/vault-filter/vault-filter.component";

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

  searchTextChanged() {
    this.onSearchTextChanged.emit(this.searchText);
  }
}
