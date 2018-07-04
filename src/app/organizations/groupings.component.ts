import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { GroupingsComponent as BaseGroupingsComponent } from 'jslib/angular/components/groupings.component';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { Organization } from 'jslib/models/domain/organization';
import { CollectionView } from 'jslib/models/view/collectionView';

@Component({
    selector: 'app-org-vault-groupings',
    templateUrl: '../vault/groupings.component.html',
})
export class GroupingsComponent extends BaseGroupingsComponent {
    @Output() onSearchTextChanged = new EventEmitter<string>();

    organization: Organization;
    searchText: string = '';
    searchPlaceholder: string = null;

    constructor(collectionService: CollectionService, folderService: FolderService,
        private apiService: ApiService, private i18nService: I18nService) {
        super(collectionService, folderService);
    }

    searchTextChanged() {
        this.onSearchTextChanged.emit(this.searchText);
    }

    async loadCollections() {
        if (this.organization.isAdmin) {
            const collections = await this.apiService.getCollections(this.organization.id);
            if (collections != null && collections.data != null && collections.data.length) {
                const decCollections: CollectionView[] = [];
                const promises: any[] = [];
                collections.data.forEach((r) => {
                    const data = new CollectionData(r);
                    const collection = new Collection(data);
                    promises.push(collection.decrypt().then((c) => decCollections.push(c)));
                });
                await Promise.all(promises);
                decCollections.sort(this.collectionService.getLocaleSortingFunction());
                this.collections = decCollections;
            } else {
                this.collections = [];
            }
        } else {
            await super.loadCollections(this.organization.id);
        }

        const unassignedCollection = new CollectionView();
        unassignedCollection.name = this.i18nService.t('unassigned');
        unassignedCollection.id = 'unassigned';
        unassignedCollection.organizationId = this.organization.id;
        unassignedCollection.readOnly = true;
        this.collections.push(unassignedCollection);
    }
}
