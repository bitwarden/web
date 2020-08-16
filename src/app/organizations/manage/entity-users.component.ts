import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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

    showSelected = false;
    loading = true;
    formPromise: Promise<any>;
    selectedCount = 0;
    searchText: string;

    private allUsers: OrganizationUserUserDetailsResponse[] = [];

    constructor(
        private apiService: ApiService,
        private i18nService: I18nService,
        private analytics: Angulartics2,
        private toasterService: ToasterService
    ) {}

    async ngOnInit() {
        await this.loadUsers();
        this.loading = false;
    }

    get users() {
        if (this.showSelected) {
            return this.allUsers.filter((u) => (u as any).checked);
        } else {
            return this.allUsers;
        }
    }

    async loadUsers() {
        const users = await this.apiService.getOrganizationUsers(this.organizationId);
        this.allUsers = users.data
            .map((r) => r)
            .sort(Utils.getSortFunction(this.i18nService, 'email'));
        if (this.entity === 'group') {
            const response = await this.apiService.getGroupUsers(
                this.organizationId,
                this.entityId
            );
            if (response != null && users.data.length > 0) {
                response.forEach((s) => {
                    const user = users.data.filter((u) => u.id === s);
                    if (user != null && user.length > 0) {
                        (user[0] as any).checked = true;
                    }
                });
            }
        } else if (this.entity === 'collection') {
            const response = await this.apiService.getCollectionUsers(
                this.organizationId,
                this.entityId
            );
            if (response != null && users.data.length > 0) {
                response.forEach((s) => {
                    const user = users.data.filter((u) => !u.accessAll && u.id === s.id);
                    if (user != null && user.length > 0) {
                        (user[0] as any).checked = true;
                        (user[0] as any).readOnly = s.readOnly;
                        (user[0] as any).hidePasswords = s.hidePasswords;
                    }
                });
            }
        }

        this.allUsers.forEach((u) => {
            if (this.entity === 'collection' && u.accessAll) {
                (u as any).checked = true;
            }
            if ((u as any).checked) {
                this.selectedCount++;
            }
        });
    }

    check(u: OrganizationUserUserDetailsResponse) {
        if (this.entity === 'collection' && u.accessAll) {
            return;
        }
        (u as any).checked = !(u as any).checked;
        this.selectedChanged(u);
    }

    selectedChanged(u: OrganizationUserUserDetailsResponse) {
        if ((u as any).checked) {
            this.selectedCount++;
        } else {
            if (this.entity === 'collection') {
                (u as any).readOnly = false;
                (u as any).hidePasswords = false;
            }
            this.selectedCount--;
        }
    }

    filterSelected(showSelected: boolean) {
        this.showSelected = showSelected;
    }

    async submit() {
        try {
            if (this.entity === 'group') {
                const selections = this.users.filter((u) => (u as any).checked).map((u) => u.id);
                this.formPromise = this.apiService.putGroupUsers(
                    this.organizationId,
                    this.entityId,
                    selections
                );
            } else {
                const selections = this.users
                    .filter((u) => (u as any).checked && !u.accessAll)
                    .map(
                        (u) =>
                            new SelectionReadOnlyRequest(
                                u.id,
                                !!(u as any).readOnly,
                                !!(u as any).hidePasswords
                            )
                    );
                this.formPromise = this.apiService.putCollectionUsers(
                    this.organizationId,
                    this.entityId,
                    selections
                );
            }
            await this.formPromise;
            this.analytics.eventTrack.next({
                action: this.entity === 'group' ? 'Edited Group Users' : 'Edited Collection Users',
            });
            this.toasterService.popAsync('success', null, this.i18nService.t('updatedUsers'));
            this.onEditedUsers.emit();
        } catch {}
    }
}
