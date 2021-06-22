import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { ValidationService } from 'jslib-angular/services/validation.service';
import { I18nService } from 'jslib-common/abstractions';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

import { OrganizationResponse } from 'jslib-common/models/response/organizationResponse';

import { ProviderService } from './provider.service';

@Component({
    selector: 'provider-attach-organization',
    templateUrl: 'organization-join-provider.component.html',
})
export class OrganizationJoinProviderComponent implements OnInit {

    providerId: string;
    provider: Provider;
    organizationId: string;
    organization: OrganizationResponse;
    formPromise: Promise<any>;
    loading = true;

    constructor(private route: ActivatedRoute, private router: Router, private apiService: ApiService, private userService: UserService,
        private providerService: ProviderService, private toasterService: ToasterService, private i18nService: I18nService,
        private validationService: ValidationService) { }

    async ngOnInit() {
        this.route.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
        });

        this.route.parent.params.subscribe(async params => {
            this.providerId = params.providerId;
            await this.load();
        });
    }

    async load() {
        if (this.providerId == null || this.organizationId == null) {
            return;
        }

        this.organization = await this.apiService.getOrganization(this.organizationId);
        this.provider = await this.userService.getProvider(this.providerId);
        this.loading = false;
    }

    async submit() {
        try {
            await this.providerService.addOrganizationToProvider(this.providerId, this.organizationId);
        } catch (e) {
            this.validationService.showError(e);
            return;
        }

        this.toasterService.popAsync('success', null, this.i18nService.t('organizationJoinedProvider'));
        this.router.navigate(['providers', this.providerId]);
    }

    async cancel() {
        this.router.navigate(['organizations', this.organizationId]);
    }
}
