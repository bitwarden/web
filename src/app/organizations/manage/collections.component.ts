import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import {
    CollectionDetailsResponse,
    CollectionResponse,
} from 'jslib/models/response/collectionResponse';
import { ListResponse } from 'jslib/models/response/listResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

import { ModalComponent } from '../../modal.component';
import { CollectionAddEditComponent } from './collection-add-edit.component';
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
        private collectionService: CollectionService, private componentFactoryResolver: ComponentFactoryResolver,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private userService: UserService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
            const queryParamsSub = this.route.queryParams.subscribe(async (qParams) => {
                this.searchText = qParams.search;
                queryParamsSub.unsubscribe();
            });
        });
    }

    async load() {
        const organization = await this.userService.getOrganization(this.organizationId);
        let response: ListResponse<CollectionResponse>;
        if (organization.isAdmin) {
            response = await this.apiService.getCollections(this.organizationId);
        } else {
            response = await this.apiService.getUserCollections();
        }
        const collections = response.data.filter((c) => c.organizationId === this.organizationId).map((r) =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
        this.loading = false;
    }

    edit(collection: CollectionView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<CollectionAddEditComponent>(
            CollectionAddEditComponent, this.addEditModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.collectionId = collection != null ? collection.id : null;
        childComponent.onSavedCollection.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedCollection.subscribe(() => {
            this.modal.close();
            this.removeCollection(collection);
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    add() {
        this.edit(null);
    }

    async delete(collection: CollectionView) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteCollectionConfirmation'), collection.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            await this.apiService.deleteCollection(this.organizationId, collection.id);
            this.analytics.eventTrack.next({ action: 'Deleted Collection' });
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedCollectionId', collection.name));
            this.removeCollection(collection);
        } catch { }
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

        childComponent.onEditedUsers.subscribe(() => {
            this.load();
            this.modal.close();
        });
        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private removeCollection(collection: CollectionView) {
        const index = this.collections.indexOf(collection);
        if (index > -1) {
            this.collections.splice(index, 1);
        }
    }
}
