import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { OrganizationUserUserDetailsResponse } from 'jslib/models/response/organizationUserResponse';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-org-people',
    templateUrl: 'people.component.html',
})
export class PeopleComponent implements OnInit {
    loading = true;
    organizationId: string;
    users: OrganizationUserUserDetailsResponse[];
    searchText: string;

    constructor(private apiService: ApiService, private route: ActivatedRoute,
        private i18nService: I18nService) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
        });
        await this.load();
    }

    async load() {
        const response = await this.apiService.getOrganizationUsers(this.organizationId);
        const users = response.data != null && response.data.length > 0 ? response.data : [];
        users.sort(Utils.getSortFunction(this.i18nService, 'email'));
        this.users = users;
        this.loading = false;
    }
}
