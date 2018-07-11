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
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { OrganizationUserConfirmRequest } from 'jslib/models/request/organizationUserConfirmRequest';

import { OrganizationUserUserDetailsResponse } from 'jslib/models/response/organizationUserResponse';

import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';

import { Utils } from 'jslib/misc/utils';

import { ModalComponent } from '../../modal.component';
import { EntityEventsComponent } from './entity-events.component';
import { UserAddEditComponent } from './user-add-edit.component';
import { UserGroupsComponent } from './user-groups.component';

@Component({
    selector: 'app-org-people',
    templateUrl: 'people.component.html',
})
export class PeopleComponent implements OnInit {
    @ViewChild('addEdit', { read: ViewContainerRef }) addEditModalRef: ViewContainerRef;
    @ViewChild('groupsTemplate', { read: ViewContainerRef }) groupsModalRef: ViewContainerRef;
    @ViewChild('eventsTemplate', { read: ViewContainerRef }) eventsModalRef: ViewContainerRef;

    loading = true;
    organizationId: string;
    users: OrganizationUserUserDetailsResponse[];
    searchText: string;
    organizationUserType = OrganizationUserType;
    organizationUserStatusType = OrganizationUserStatusType;
    actionPromise: Promise<any>;
    accessEvents = false;
    accessGroups = false;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private platformUtilsService: PlatformUtilsService, private analytics: Angulartics2,
        private toasterService: ToasterService, private cryptoService: CryptoService,
        private userService: UserService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            const organization = await this.userService.getOrganization(this.organizationId);
            this.accessEvents = organization.useEvents;
            this.accessGroups = organization.useGroups;
            await this.load();

            this.route.queryParams.subscribe(async (qParams) => {
                this.searchText = qParams.search;
                if (qParams.viewEvents != null) {
                    const user = this.users.filter((u) => u.id === qParams.viewEvents);
                    if (user.length > 0) {
                        this.events(user[0]);
                    }
                }
            });
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

    groups(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.groupsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<UserGroupsComponent>(
            UserGroupsComponent, this.groupsModalRef);

        childComponent.name = user != null ? user.name || user.email : null;
        childComponent.organizationId = this.organizationId;
        childComponent.organizationUserId = user != null ? user.id : null;
        childComponent.onSavedUser.subscribe(() => {
            this.modal.close();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
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

    async reinvite(user: OrganizationUserUserDetailsResponse) {
        if (this.actionPromise != null) {
            return;
        }
        this.actionPromise = this.apiService.postOrganizationUserReinvite(this.organizationId, user.id);
        await this.actionPromise;
        this.analytics.eventTrack.next({ action: 'Reinvited User' });
        this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenReinvited', user.name || user.email));
        this.actionPromise = null;
    }

    async confirm(user: OrganizationUserUserDetailsResponse) {
        if (this.actionPromise != null) {
            return;
        }
        this.actionPromise = this.doConfirmation(user);
        await this.actionPromise;
        user.status = OrganizationUserStatusType.Confirmed;
        this.analytics.eventTrack.next({ action: 'Confirmed User' });
        this.toasterService.popAsync('success', null, this.i18nService.t('hasBeenConfirmed', user.name || user.email));
        this.actionPromise = null;
    }

    async events(user: OrganizationUserUserDetailsResponse) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.eventsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityEventsComponent>(
            EntityEventsComponent, this.eventsModalRef);

        childComponent.name = user.name || user.email;
        childComponent.organizationId = this.organizationId;
        childComponent.entityId = user.id;
        childComponent.showUser = false;
        childComponent.entity = 'user';

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private async doConfirmation(user: OrganizationUserUserDetailsResponse) {
        const orgKey = await this.cryptoService.getOrgKey(this.organizationId);
        const publicKeyResponse = await this.apiService.getUserPublicKey(user.userId);
        const publicKey = Utils.fromB64ToArray(publicKeyResponse.publicKey);
        const key = await this.cryptoService.rsaEncrypt(orgKey.key, publicKey.buffer);
        const request = new OrganizationUserConfirmRequest();
        request.key = key.encryptedString;
        await this.apiService.postOrganizationUserConfirm(this.organizationId, user.id, request);
    }

    private removeUser(user: OrganizationUserUserDetailsResponse) {
        const index = this.users.indexOf(user);
        if (index > -1) {
            this.users.splice(index, 1);
        }
    }
}
