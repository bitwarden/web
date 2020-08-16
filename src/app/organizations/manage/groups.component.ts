import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { UserService } from 'jslib/abstractions/user.service';

import { GroupResponse } from 'jslib/models/response/groupResponse';

import { Utils } from 'jslib/misc/utils';

import { ModalComponent } from '../../modal.component';
import { EntityUsersComponent } from './entity-users.component';
import { GroupAddEditComponent } from './group-add-edit.component';

@Component({
    selector: 'app-org-groups',
    templateUrl: 'groups.component.html',
})
export class GroupsComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef, static: true })
    addEditModalRef: ViewContainerRef;
    @ViewChild('usersTemplate', { read: ViewContainerRef, static: true })
    usersModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    groups: GroupResponse[];
    pagedGroups: GroupResponse[];
    searchText: string;

    protected didScroll = false;
    protected pageSize = 100;

    private pagedGroupsCount = 0;
    private modal: ModalComponent = null;

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private analytics: Angulartics2,
        private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService,
        private userService: UserService,
        private router: Router,
        private searchService: SearchService
    ) {}

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            if (organization == null || !organization.useGroups) {
                this.router.navigate(['/organizations', this.organizationId]);
                return;
            }
            await this.load();
            const queryParamsSub = this.route.queryParams.subscribe(async (qParams) => {
                this.searchText = qParams.search;
                if (queryParamsSub != null) {
                    queryParamsSub.unsubscribe();
                }
            });
        });
    }

    async load() {
        const response = await this.apiService.getGroups(this.organizationId);
        const groups = response.data != null && response.data.length > 0 ? response.data : [];
        groups.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.groups = groups;
        this.resetPaging();
        this.loading = false;
    }

    loadMore() {
        if (!this.groups || this.groups.length <= this.pageSize) {
            return;
        }
        const pagedLength = this.pagedGroups.length;
        let pagedSize = this.pageSize;
        if (pagedLength === 0 && this.pagedGroupsCount > this.pageSize) {
            pagedSize = this.pagedGroupsCount;
        }
        if (this.groups.length > pagedLength) {
            this.pagedGroups = this.pagedGroups.concat(
                this.groups.slice(pagedLength, pagedLength + pagedSize)
            );
        }
        this.pagedGroupsCount = this.pagedGroups.length;
        this.didScroll = this.pagedGroups.length > this.pageSize;
    }

    edit(group: GroupResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<GroupAddEditComponent>(
            GroupAddEditComponent,
            this.addEditModalRef
        );

        childComponent.organizationId = this.organizationId;
        childComponent.groupId = group != null ? group.id : null;
        childComponent.onSavedGroup.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedGroup.subscribe(() => {
            this.modal.close();
            this.removeGroup(group);
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    add() {
        this.edit(null);
    }

    async delete(group: GroupResponse) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteGroupConfirmation'),
            group.name,
            this.i18nService.t('yes'),
            this.i18nService.t('no'),
            'warning'
        );
        if (!confirmed) {
            return false;
        }

        try {
            await this.apiService.deleteGroup(this.organizationId, group.id);
            this.analytics.eventTrack.next({ action: 'Deleted Group' });
            this.toasterService.popAsync(
                'success',
                null,
                this.i18nService.t('deletedGroupId', group.name)
            );
            this.removeGroup(group);
        } catch {}
    }

    users(group: GroupResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.usersModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityUsersComponent>(
            EntityUsersComponent,
            this.usersModalRef
        );

        childComponent.organizationId = this.organizationId;
        childComponent.entity = 'group';
        childComponent.entityId = group.id;
        childComponent.entityName = group.name;

        childComponent.onEditedUsers.subscribe(() => {
            this.modal.close();
        });
        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async resetPaging() {
        this.pagedGroups = [];
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
        return !searching && this.groups && this.groups.length > this.pageSize;
    }

    private removeGroup(group: GroupResponse) {
        const index = this.groups.indexOf(group);
        if (index > -1) {
            this.groups.splice(index, 1);
            this.resetPaging();
        }
    }
}
