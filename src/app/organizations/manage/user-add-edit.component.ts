import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CollectionData } from 'jslib/models/data/collectionData';
import { Collection } from 'jslib/models/domain/collection';
import { OrganizationUserInviteRequest } from 'jslib/models/request/organizationUserInviteRequest';
import { OrganizationUserUpdateRequest } from 'jslib/models/request/organizationUserUpdateRequest';
import { SelectionReadOnlyRequest } from 'jslib/models/request/selectionReadOnlyRequest';
import { CollectionDetailsResponse } from 'jslib/models/response/collectionResponse';
import { CollectionView } from 'jslib/models/view/collectionView';

import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { PermissionsApi } from 'jslib/models/api/permissionsApi';

@Component({
    selector: 'app-user-add-edit',
    templateUrl: 'user-add-edit.component.html',
})
export class UserAddEditComponent implements OnInit {
    @Input() name: string;
    @Input() organizationUserId: string;
    @Input() organizationId: string;
    @Output() onSavedUser = new EventEmitter();
    @Output() onDeletedUser = new EventEmitter();

    loading = true;
    editMode: boolean = false;
    title: string;
    emails: string;
    type: OrganizationUserType = OrganizationUserType.User;
    permissions = new PermissionsApi();
    showCustom = false;
    access: 'all' | 'selected' = 'selected';
    collections: CollectionView[] = [];
    formPromise: Promise<any>;
    deletePromise: Promise<any>;
    organizationUserType = OrganizationUserType;

    get customUserTypeSelected(): boolean {
        return this.type === OrganizationUserType.Custom;
    }

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private collectionService: CollectionService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.editMode = this.loading = this.organizationUserId != null;
        await this.loadCollections();

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editUser');
            try {
                const user = await this.apiService.getOrganizationUser(this.organizationId, this.organizationUserId);
                this.access = user.accessAll ? 'all' : 'selected';
                this.type = user.type;
                if (user.type === OrganizationUserType.Custom) {
                    this.permissions = user.permissions;
                }
                if (user.collections != null && this.collections != null) {
                    user.collections.forEach(s => {
                        const collection = this.collections.filter(c => c.id === s.id);
                        if (collection != null && collection.length > 0) {
                            (collection[0] as any).checked = true;
                            collection[0].readOnly = s.readOnly;
                            collection[0].hidePasswords = s.hidePasswords;
                        }
                    });
                }
            } catch { }
        } else {
            this.title = this.i18nService.t('inviteUser');
        }

        this.loading = false;
    }

    async loadCollections() {
        const response = await this.apiService.getCollections(this.organizationId);
        const collections = response.data.map(r =>
            new Collection(new CollectionData(r as CollectionDetailsResponse)));
        this.collections = await this.collectionService.decryptMany(collections);
    }

    check(c: CollectionView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
        if (!(c as any).checked) {
            c.readOnly = false;
        }
    }

    selectAll(select: boolean) {
        this.collections.forEach(c => this.check(c, select));
    }

    setRequestPermissions(p: PermissionsApi, clearPermissions: boolean) {
        p.accessBusinessPortal = clearPermissions ?
            false :
            this.permissions.accessBusinessPortal;
        p.accessEventLogs = this.permissions.accessEventLogs = clearPermissions ?
            false :
            this.permissions.accessEventLogs;
        p.accessImportExport = clearPermissions ?
            false :
            this.permissions.accessImportExport;
        p.accessReports = clearPermissions ?
            false :
            this.permissions.accessReports;
        p.manageAllCollections = clearPermissions ?
            false :
            this.permissions.manageAllCollections;
        p.manageAssignedCollections = clearPermissions ?
            false :
            this.permissions.manageAssignedCollections;
        p.manageGroups = clearPermissions ?
            false :
            this.permissions.manageGroups;
        p.manageSso = clearPermissions ?
            false :
            this.permissions.manageSso;
        p.managePolicies = clearPermissions ?
            false :
            this.permissions.managePolicies;
        p.manageUsers = clearPermissions ?
            false :
            this.permissions.manageUsers;
        p.manageResetPassword = clearPermissions ?
            false :
            this.permissions.manageResetPassword;
        return p;
    }

    async submit() {
        let collections: SelectionReadOnlyRequest[] = null;
        if (this.access !== 'all') {
            collections = this.collections.filter(c => (c as any).checked)
                .map(c => new SelectionReadOnlyRequest(c.id, !!c.readOnly, !!c.hidePasswords));
        }

        try {
            if (this.editMode) {
                const request = new OrganizationUserUpdateRequest();
                request.accessAll = this.access === 'all';
                request.type = this.type;
                request.collections = collections;
                request.permissions = this.setRequestPermissions(request.permissions ?? new PermissionsApi(), request.type !== OrganizationUserType.Custom);
                this.formPromise = this.apiService.putOrganizationUser(this.organizationId, this.organizationUserId,
                    request);
            } else {
                const request = new OrganizationUserInviteRequest();
                request.emails = this.emails.trim().split(/\s*,\s*/);
                request.accessAll = this.access === 'all';
                request.type = this.type;
                request.permissions = this.setRequestPermissions(request.permissions ?? new PermissionsApi(), request.type !== OrganizationUserType.Custom);
                request.collections = collections;
                this.formPromise = this.apiService.postOrganizationUserInvite(this.organizationId, request);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({ action: this.editMode ? 'Edited User' : 'Invited User' });
            this.toasterService.popAsync('success', null,
                this.i18nService.t(this.editMode ? 'editedUserId' : 'invitedUsers', this.name));
            this.onSavedUser.emit();
        } catch { }
    }

    async delete() {
        if (!this.editMode) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), this.name,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.deletePromise = this.apiService.deleteOrganizationUser(this.organizationId, this.organizationUserId);
            await this.deletePromise;
            this.analytics.eventTrack.next({ action: 'Deleted User' });
            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', this.name));
            this.onDeletedUser.emit();
        } catch { }
    }

}
