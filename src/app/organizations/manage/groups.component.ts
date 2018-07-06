import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { GroupResponse } from 'jslib/models/response/groupResponse';

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
        groups.sort((a, b) => {
            if (a.name == null && b.name != null) {
                return -1;
            }
            if (a.name != null && b.name == null) {
                return 1;
            }
            if (a.name == null && b.name == null) {
                return 0;
            }

            return this.i18nService.collator ? this.i18nService.collator.compare(a.name, b.name) :
                a.name.localeCompare(b.name);
        });
        this.groups = groups;
        this.loading = false;
    }
}
