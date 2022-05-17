import { BehaviorSubject, Observable } from "rxjs";

import { VaultFilterService as BaseVaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";

export class VaultFilterService extends BaseVaultFilterService {
  private _collapsedFilterNodes = new BehaviorSubject<Set<string>>(null);
  collapsedFilterNodes$: Observable<Set<string>> = this._collapsedFilterNodes.asObservable();

  async buildCollapsedFilterNodes(): Promise<Set<string>> {
    const nodes = await super.buildCollapsedFilterNodes();
    this._collapsedFilterNodes.next(nodes);
    return nodes;
  }

  async storeCollapsedFilterNodes(collapsedFilterNodes: Set<string>): Promise<void> {
    await super.storeCollapsedFilterNodes(collapsedFilterNodes);
    this._collapsedFilterNodes.next(collapsedFilterNodes);
  }

  async ensureVaultFiltersAreExpanded() {
    const collapsedFilterNodes = await super.buildCollapsedFilterNodes();
    if (!collapsedFilterNodes.has("vaults")) {
      return;
    }
    collapsedFilterNodes.delete("vaults");
    await this.storeCollapsedFilterNodes(collapsedFilterNodes);
  }
}
