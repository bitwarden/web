import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OrganizationPlansComponent } from './organization-plans.component';

@Component({
    selector: 'app-create-organization',
    templateUrl: 'create-organization.component.html',
})
export class CreateOrganizationComponent implements OnInit {
    @ViewChild(OrganizationPlansComponent, { static: true })
    orgPlansComponent: OrganizationPlansComponent;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async (qParams) => {
            if (
                qParams.plan === 'families' ||
                qParams.plan === 'teams' ||
                qParams.plan === 'enterprise'
            ) {
                this.orgPlansComponent.plan = qParams.plan;
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }
}
