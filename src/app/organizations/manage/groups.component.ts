import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';

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

    constructor(private apiService: ApiService, private route: ActivatedRoute) { }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
        });
        await this.load();
    }

    async load() {
        const response = await this.apiService.getGroups(this.organizationId);
        if (response.data != null && response.data.length > 0) {
            this.groups = response.data;
        } else {
            this.groups = [];
        }
        this.loading = false;
    }
}
