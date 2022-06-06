import { Injectable } from "@angular/core";

import { DynamicTreeNode } from "jslib-angular/modules/vault-filter/models/dynamic-tree-node.model";
import { VaultFilterService as BaseVaultFilterService } from "jslib-angular/modules/vault-filter/vault-filter.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CollectionData } from "jslib-common/models/data/collectionData";
import { Collection } from "jslib-common/models/domain/collection";
import { CollectionDetailsResponse } from "jslib-common/models/response/collectionResponse";
import { CollectionView } from "jslib-common/models/view/collectionView";

@Injectable()
export class VaultFilterService extends BaseVaultFilterService {
  constructor(
    stateService: StateService,
    organizationService: OrganizationService,
    folderService: FolderService,
    cipherService: CipherService,
    collectionService: CollectionService,
    policyService: PolicyService,
    protected apiService: ApiService
  ) {
    super(
      stateService,
      organizationService,
      folderService,
      cipherService,
      collectionService,
      policyService
    );
  }

  async buildAdminCollections(organizationId: string) {
    let result: CollectionView[] = [];
    const collectionResponse = await this.apiService.getCollections(organizationId);
    if (collectionResponse?.data != null && collectionResponse.data.length) {
      const collectionDomains = collectionResponse.data.map(
        (r: CollectionDetailsResponse) => new Collection(new CollectionData(r))
      );
      result = await this.collectionService.decryptMany(collectionDomains);
    }

    const nestedCollections = await this.collectionService.getAllNested(result);
    return new DynamicTreeNode<CollectionView>({
      fullList: result,
      nestedList: nestedCollections,
    });
  }
}
