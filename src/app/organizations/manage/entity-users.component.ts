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
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-entity-users',
    templateUrl: 'entity-users.component.html',
})
export class EntityUsersComponent implements OnInit {
    @Input() entity: 'group' | 'collection';
    @Input() entityId: string;
    @Input() entityName: string;
    @Input() organizationId: string;
    @Output() onRemovedUser = new EventEmitter();

    organizationUserType = OrganizationUserType;
    organizationUserStatusType = OrganizationUserStatusType;

    loading = true;
    users: any[] = [];
    actionPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        await this.loadUsers();
        this.loading = false;
    }

    async loadUsers() {
        let users: any[] = [];
        if (this.entity === 'group') {
            const response = await this.apiService.getGroupUsers(this.organizationId, this.entityId);
            users = response.data.map((r) => r);
        } else if (this.entity === 'collection') {
            const response = await this.apiService.getCollectionUsers(this.organizationId, this.entityId);
            users = response.data.map((r) => r);
        }
        users.sort(Utils.getSortFunction(this.i18nService, 'email'));
        this.users = users;
    }

    async remove(user: any) {
        if (this.actionPromise != null || (this.entity === 'collection' && user.accessAll)) {
            return;
        }

        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('removeUserConfirmation'), user.email,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            if (this.entity === 'group') {
                this.actionPromise = this.apiService.deleteGroupUser(this.organizationId, this.entityId,
                    user.organizationUserId);
                await this.actionPromise;
                this.analytics.eventTrack.next({ action: 'Removed User From Group' });
            } else if (this.entity === 'collection') {
                this.actionPromise = this.apiService.deleteCollectionUser(this.organizationId, this.entityId,
                    user.organizationUserId);
                await this.actionPromise;
                this.analytics.eventTrack.next({ action: 'Removed User From Collection' });
            }

            this.toasterService.popAsync('success', null, this.i18nService.t('removedUserId', user.email));
            this.onRemovedUser.emit();
            const index = this.users.indexOf(user);
            if (index > -1) {
                this.users.splice(index, 1);
            }
        } catch { }
    }
}
