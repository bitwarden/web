import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { CollectionDetailsResponse } from 'jslib/models/response/collectionResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

import { ModalComponent } from '../../modal.component';
import { EntityUsersComponent } from './entity-users.component';

@Component({
    selector: 'app-org-manage-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef }) addEditModalRef: ViewContainerRef;
    @ViewChild('usersTemplate', { read: ViewContainerRef }) usersModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    collections: CollectionView[];
    searchText: string;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private collectionService: CollectionService, private componentFactoryResolver: ComponentFactoryResolver) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getCollections(this.organizationId);
        const collections = response.data.map((r) =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
        this.loading = false;
    }

    edit(collection: CollectionView) {
        //
    }

    add() {
        this.edit(null);
    }

    async delete(collection: CollectionView) {
        //
    }

    users(collection: CollectionView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.usersModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityUsersComponent>(
            EntityUsersComponent, this.usersModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.entity = 'collection';
        childComponent.entityId = collection.id;
        childComponent.entityName = collection.name;

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }
}
