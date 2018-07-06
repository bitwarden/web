import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { CollectionDetailsResponse } from 'jslib/models/response/collectionResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

@Component({
    selector: 'app-org-manage-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent implements OnInit {
    loading = true;
    organizationId: string;
    collections: CollectionView[];
    searchText: string;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private collectionService: CollectionService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
        });
        await this.load();
    }

    async load() {
        const response = await this.apiService.getCollections(this.organizationId);
        const collections = response.data.map((r) =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
        this.loading = false;
    }
}
