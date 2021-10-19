import {
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'angular2-toaster';

import { first } from 'rxjs/operators';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SearchService } from 'jslib-common/abstractions/search.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ModalService } from 'jslib-angular/services/modal.service';

import { CollectionData } from 'jslib-common/models/data/collectionData';
import { Collection } from 'jslib-common/models/domain/collection';
import {
    CollectionDetailsResponse,
    CollectionResponse,
} from 'jslib-common/models/response/collectionResponse';
import { ListResponse } from 'jslib-common/models/response/listResponse';
import { CollectionView } from 'jslib-common/models/view/collectionView';

import { CollectionAddEditComponent } from './collection-add-edit.component';
import { EntityUsersComponent } from './entity-users.component';

@Component({
    selector: 'app-org-manage-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
    @ViewChild('usersTemplate', { read: ViewContainerRef, static: true }) usersModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    collections: CollectionView[];
    pagedCollections: CollectionView[];
    searchText: string;

    protected didScroll = false;
    protected pageSize = 100;

    private pagedCollectionsCount = 0;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private collectionService: CollectionService, private modalService: ModalService,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService, private userService: UserService,
        private searchService: SearchService, private logService: LogService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
            this.route.queryParams.pipe(first()).subscribe(async qParams => {
                this.searchText = qParams.search;
            });
        });
    }

    async load() {
        const organization = await this.userService.getOrganization(this.organizationId);
        let response: ListResponse<CollectionResponse>;
        if (organization.canViewAllCollections) {
            response = await this.apiService.getCollections(this.organizationId);
        } else {
            response = await this.apiService.getUserCollections();
        }
        const collections = response.data.filter(c => c.organizationId === this.organizationId).map(r =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
        this.resetPaging();
        this.loading = false;
    }

    loadMore() {
        if (!this.collections || this.collections.length <= this.pageSize) {
            return;
        }
        const pagedLength = this.pagedCollections.length;
        let pagedSize = this.pageSize;
        if (pagedLength === 0 && this.pagedCollectionsCount > this.pageSize) {
            pagedSize = this.pagedCollectionsCount;
        }
        if (this.collections.length > pagedLength) {
            this.pagedCollections =
                this.pagedCollections.concat(this.collections.slice(pagedLength, pagedLength + pagedSize));
        }
        this.pagedCollectionsCount = this.pagedCollections.length;
        this.didScroll = this.pagedCollections.length > this.pageSize;
    }

    async edit(collection: CollectionView) {
        const [modal] = await this.modalService.openViewRef(CollectionAddEditComponent, this.addEditModalRef, comp => {
            comp.organizationId = this.organizationId;
            comp.collectionId = collection != null ? collection.id : null;
            comp.onSavedCollection.subscribe(() => {
                modal.close();
                this.load();
            });
            comp.onDeletedCollection.subscribe(() => {
                modal.close();
                this.removeCollection(collection);
            });
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
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedCollectionId', collection.name));
            this.removeCollection(collection);
        } catch (e) {
            this.logService.error(e);
        }
    }

    async users(collection: CollectionView) {
        const [modal] = await this.modalService.openViewRef(EntityUsersComponent, this.usersModalRef, comp => {
            comp.organizationId = this.organizationId;
            comp.entity = 'collection';
            comp.entityId = collection.id;
            comp.entityName = collection.name;

            comp.onEditedUsers.subscribe(() => {
                this.load();
                modal.close();
            });
        });
    }

    async resetPaging() {
        this.pagedCollections = [];
        this.loadMore();
    }

    isSearching() {
        return this.searchService.isSearchable(this.searchText);
    }

    isPaging() {
        const searching = this.isSearching();
        if (searching && this.didScroll) {
            this.resetPaging();
        }
        return !searching && this.collections && this.collections.length > this.pageSize;
    }

    private removeCollection(collection: CollectionView) {
        const index = this.collections.indexOf(collection);
        if (index > -1) {
            this.collections.splice(index, 1);
            this.resetPaging();
        }
    }
}
