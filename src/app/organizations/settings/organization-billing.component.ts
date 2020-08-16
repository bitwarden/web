import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { UserBillingComponent } from '../../settings/user-billing.component';

@Component({
    selector: 'app-org-billing',
    templateUrl: '../../settings/user-billing.component.html',
})
export class OrganizationBillingComponent extends UserBillingComponent implements OnInit {
    constructor(
        apiService: ApiService,
        i18nService: I18nService,
        analytics: Angulartics2,
        toasterService: ToasterService,
        private route: ActivatedRoute,
        platformUtilsService: PlatformUtilsService
    ) {
        super(apiService, i18nService, analytics, toasterService, platformUtilsService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
            this.firstLoaded = true;
        });
    }
}
