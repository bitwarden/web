import {
    Component,
    Input,
} from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { OrganizationUserBulkRequest } from 'jslib-common/models/request/organizationUserBulkRequest';

import { OrganizationUserUserDetailsResponse } from 'jslib-common/models/response/organizationUserResponse';

@Component({
    selector: 'app-bulk-remove',
    templateUrl: 'bulk-remove.component.html',
})
export class BulkRemoveComponent {

    @Input() organizationId: string;
    @Input() users: OrganizationUserUserDetailsResponse[];

    statuses: Map<string, string> = new Map();

    loading: boolean = false;
    done: boolean = false;
    error: string;

    constructor(private apiService: ApiService, private i18nService: I18nService) { }

    async submit() {
        this.loading = true;
        try {
            const request = new OrganizationUserBulkRequest(this.users.map(user => user.id));
            const response = await this.apiService.deleteManyOrganizationUsers(this.organizationId, request);

            response.data.forEach(entry => {
                const error = entry.error !== '' ? entry.error : this.i18nService.t('bulkRemovedMessage');
                this.statuses.set(entry.id, error);
            });
            this.done = true;
        } catch (e) {
            this.error = e.message;
        }

        this.loading = false;
    }
}
