import { DynamicTreeNode } from "jslib-angular/modules/vault-filter/models/dynamic-tree-node.model";
import { VaultFilterServiceInterface as BaseVaultFilterServiceInterface } from "jslib-angular/modules/vault-filter/vault-filter.service.interface";
import { CollectionView } from "jslib-common/models/view/collectionView";

export abstract class VaultFilterServiceInterface extends BaseVaultFilterServiceInterface {
  buildAdminCollections: (organizationId: string) => Promise<DynamicTreeNode<CollectionView>>;
}
