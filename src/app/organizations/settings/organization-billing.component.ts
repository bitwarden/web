import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { UserBillingComponent } from '../../settings/user-billing.component';

@Component({
    selector: 'app-org-billing',
    templateUrl: '../../settings/user-billing.component.html',
})
export class OrganizationBillingComponent extends UserBillingComponent implements OnInit {
    constructor(apiService: ApiService, i18nService: I18nService, toasterService: ToasterService,
        private route: ActivatedRoute, platformUtilsService: PlatformUtilsService) {
        super(apiService, i18nService, toasterService, platformUtilsService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
            this.firstLoaded = true;
        });
    }
}
