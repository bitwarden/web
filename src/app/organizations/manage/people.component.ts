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

import { OrganizationUserUserDetailsResponse } from 'jslib/models/response/organizationUserResponse';

import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';

import { Utils } from 'jslib/misc/utils';

import { ModalComponent } from '../../modal.component';
import { UserAddEditComponent } from './user-add-edit.component';

@Component({
    selector: 'app-org-people',
    templateUrl: 'people.component.html',
})
export class PeopleComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef }) addEditModalRef: ViewContainerRef;
    @ViewChild('groupsTemplate', { read: ViewContainerRef }) groupsModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    users: OrganizationUserUserDetailsResponse[];
    searchText: string;
    organizationUserType = OrganizationUserType;
    organizationUserStatusType = OrganizationUserStatusType;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private analytics: Angulartics2,
        private toasterService: ToasterService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        const response = await this.apiService.getOrganizationUsers(this.organizationId);
        const users = response.data != null && response.data.length > 0 ? response.data : [];
        users.sort(Utils.getSortFunction(this.i18nService, 'email'));
        this.users = users;
        this.loading = false;
    }

    edit(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.addEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<UserAddEditComponent>(
            UserAddEditComponent, this.addEditModalRef);

        childComponent.name = user != null ? user.name || user.email : null;
        childComponent.organizationId = this.organizationId;
        childComponent.organizationUserId = user != null ? user.id : null;
        childComponent.onSavedUser.subscribe(() => {
            this.modal.close();
            this.load();
        });
        childComponent.onDeletedUser.subscribe(() => {
            this.modal.close();
            this.removeUser(user);
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    invite() {
        this.edit(null);
    }

    async remove(user: OrganizationUserUserDetailsResponse) {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), user.name || user.email,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            await this.apiService.deleteOrganizationUser(this.organizationId, user.id);
            this.analytics.eventTrack.next({ action: 'Deleted User' });
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', user.name || user.email));
            this.removeUser(user);
        } catch { }
    }

    private removeUser(user: OrganizationUserUserDetailsResponse) {
        const index = this.users.indexOf(user);
        if (index > -1) {
            this.users.splice(index, 1);
        }
    }
}
