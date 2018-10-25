import { Component } from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { Organization } from 'jslib/models/domain/organization';
import {
    CollectionDetailsResponse,
    CollectionResponse,
} from 'jslib/models/response/collectionResponse';
import { ListResponse } from 'jslib/models/response/listResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

import { GroupingsComponent as BaseGroupingsComponent } from '../../vault/groupings.component';

@Component({
    selector: 'app-org-vault-groupings',
    templateUrl: '../../vault/groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    organization: Organization;

    constructor(collectionService: CollectionService, folderService: FolderService,
        private apiService: ApiService, private i18nService: I18nService) {
        super(collectionService, folderService);
    }

    async loadCollections() {
        if (!this.organization.isAdmin) {
            await super.loadCollections(this.organization.id);
            return;
        }

        const collections = await this.apiService.getCollections(this.organization.id);
        if (collections != null && collections.data != null && collections.data.length) {
            const collectionDomains = collections.data.map((r) =>
                new Collection(new CollectionData(r as CollectionDetailsResponse)));
            this.collections = await this.collectionService.decryptMany(collectionDomains);
        } else {
            this.collections = [];
        }

        const unassignedCollection = new CollectionView();
        unassignedCollection.name = this.i18nService.t('unassigned');
        unassignedCollection.id = 'unassigned';
        unassignedCollection.organizationId = this.organization.id;
        unassignedCollection.readOnly = true;
        this.collections.push(unassignedCollection);

        if (this.loadNestedCollections) {
            this.nestedCollections = await this.collectionService.getAllNested(this.collections);
        }
    }
}
