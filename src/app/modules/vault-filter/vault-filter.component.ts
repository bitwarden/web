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

  async initCollections() {
    return await this.vaultFilterService.buildCollections(this.organization?.id);
  }
}
