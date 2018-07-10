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
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

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
    @ViewChild('addEdit', { read: ViewContainerRef }) addEditModalRef: ViewContainerRef;
    @ViewChild('usersTemplate', { read: ViewContainerRef }) usersModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    groups: GroupResponse[];
    searchText: string;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getGroups(this.organizationId);
        const groups = response.data != null && response.data.length > 0 ? response.data : [];
        groups.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.groups = groups;
        this.loading = false;
    }

    edit(group: GroupResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<GroupAddEditComponent>(
            GroupAddEditComponent, this.addEditModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.groupId = group != null ? group.id : null;
        childComponent.onSavedGroup.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedGroup.subscribe(() => {
            this.modal.close();
            this.load();
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
            this.i18nService.t('deleteGroupConfirmation'), group.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            await this.apiService.deleteGroup(this.organizationId, group.id);
            this.analytics.eventTrack.next({ action: 'Deleted Group' });
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedGroupId', group.name));
            const index = this.groups.indexOf(group);
            if (index > -1) {
                this.groups.splice(index, 1);
            }
        } catch { }
    }

    users(group: GroupResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.usersModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityUsersComponent>(
            EntityUsersComponent, this.usersModalRef);

        childComponent.organizationId = this.organizationId;
        childComponent.entity = 'group';
        childComponent.entityId = group.id;
        childComponent.entityName = group.name;

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }
}
