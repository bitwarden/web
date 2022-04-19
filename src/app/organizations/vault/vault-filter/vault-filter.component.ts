import { Component } from "@angular/core";

import { VaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";
import { Organization } from "jslib-common/models/domain/organization";

import { VaultFilterComponent as BaseVaultFilterComponent } from "../../../modules/vault-filter/vault-filter.component";

@Component({
  selector: "app-org-vault-filter",
  templateUrl: "../../../modules/vault-filter/vault-filter.component.html",
})
export class VaultFilterComponent extends BaseVaultFilterComponent {
  organization: Organization;

  constructor(vaultFilterService: VaultFilterService) {
    super(vaultFilterService);
  }
}
