import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { GroupResponse } from 'jslib/models/response/groupResponse';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-org-groups',
    templateUrl: 'groups.component.html',
})
export class GroupsComponent implements OnInit {
    loading = true;
    organizationId: string;
    groups: GroupResponse[];
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
        const response = await this.apiService.getGroups(this.organizationId);
        const groups = response.data != null && response.data.length > 0 ? response.data : [];
        groups.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.groups = groups;
        this.loading = false;
    }
}
