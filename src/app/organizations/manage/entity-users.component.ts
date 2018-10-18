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

import { OrganizationUserStatusType } from 'jslib/enums/organizationUserStatusType';
import { OrganizationUserType } from 'jslib/enums/organizationUserType';
import { SelectionReadOnlyRequest } from 'jslib/models/request/selectionReadOnlyRequest';
import { OrganizationUserUserDetailsResponse } from 'jslib/models/response/organizationUserResponse';

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
    @Output() onEditedUsers = new EventEmitter();

    organizationUserType = OrganizationUserType;
    organizationUserStatusType = OrganizationUserStatusType;

    loading = true;
    users: OrganizationUserUserDetailsResponse[] = [];
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService) { }

    async ngOnInit() {
        await this.loadUsers();
        this.loading = false;
    }

    async loadUsers() {
        const users = await this.apiService.getOrganizationUsers(this.organizationId);
        this.users = users.data.map((r) => r).sort(Utils.getSortFunction(this.i18nService, 'email'));
        if (this.entity === 'group') {
            const response = await this.apiService.getGroupUsers(this.organizationId, this.entityId);
            if (response != null && users.data.length > 0) {
                response.forEach((s) => {
                    const user = users.data.filter((u) => !u.accessAll && u.id === s);
                    if (user != null && user.length > 0) {
                        (user[0] as any).checked = true;
                    }
                });
            }
        } else if (this.entity === 'collection') {
            const response = await this.apiService.getCollectionUsers(this.organizationId, this.entityId);
            if (response != null && users.data.length > 0) {
                response.forEach((s) => {
                    const user = users.data.filter((u) => !u.accessAll && u.id === s.id);
                    if (user != null && user.length > 0) {
                        (user[0] as any).checked = true;
                        (user[0] as any).readOnly = s.readOnly;
                    }
                });
            }
        }

        this.users.forEach((u) => {
            if (u.accessAll) {
                (u as any).checked = true;
            }
        });
    }

    check(u: OrganizationUserUserDetailsResponse) {
        if (u.accessAll) {
            return;
        }
        (u as any).checked = !(u as any).checked;
    }

    async submit() {
        try {
            if (this.entity === 'group') {
                const selections = this.users.filter((u) => (u as any).checked && !u.accessAll).map((u) => u.id);
                this.formPromise = this.apiService.putGroupUsers(this.organizationId, this.entityId, selections);
            } else {
                const selections = this.users.filter((u) => (u as any).checked && !u.accessAll)
                    .map((u) => new SelectionReadOnlyRequest(u.id, !!(u as any).readOnly));
                this.formPromise = this.apiService.putCollectionUsers(this.organizationId, this.entityId, selections);
            }
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.entity === 'group' ? 'Edited Group Users' : 'Edited Collection Users',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedUsers'));
            this.onEditedUsers.emit();
        } catch { }
    }
}
