import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import {
    Toast,
    ToasterService,
} from 'angular2-toaster';

import { first } from 'rxjs/operators';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ValidationService } from 'jslib-angular/services/validation.service';
import { OrganizationSponsorshipRedeemRequest } from 'jslib-common/models/request/organization/organizationSponsorshipRedeemRequest';
import { PlanSponsorshipType } from 'jslib-common/enums/planSponsorshipType';
import { Organization } from 'jslib-common/models/domain/organization';
import { ProductType } from 'jslib-common/enums/productType';

@Component({
    selector: 'families-for-enterprise-setup',
    templateUrl: 'families-for-enterprise-setup.component.html',
})
export class FamiliesForEnterpriseSetupComponent implements OnInit {
    loading = true;
    formPromise: Promise<any>;

    token: string;
    existingFamilyOrganizations: Organization[];
    selectedFamilyOrganizationId: string;
    newOrganization: boolean = false;

    constructor(private router: Router, private toasterService: ToasterService,
        private i18nService: I18nService, private route: ActivatedRoute,
        private apiService: ApiService, private syncService: SyncService,
        private validationService: ValidationService, private userService: UserService) { }

    async ngOnInit() {
        document.body.classList.remove('layout_frontend');
        this.route.queryParams.pipe(first()).subscribe(async qParams => {
            const error = qParams.token == null;

            if (error) {
                const toast: Toast = {
                    type: 'error',
                    title: null,
                    body: this.i18nService.t('sponsoredFamiliesAcceptFailed'),
                    timeout: 10000,
                };
                this.toasterService.popAsync(toast);
                this.router.navigate(['/']);
                return;
            }

            this.token = qParams.token;

            await this.syncService.fullSync(true);
            this.loading = false;

            this.existingFamilyOrganizations = (await this.userService.getAllOrganizations())
                .filter(o => o.planProductType === ProductType.Families);
        });
    }

    async submit() {
        this.formPromise = this.doSubmit();
        await this.formPromise;
        this.formPromise = null;
    }

    async doSubmit() {
        if (this.newOrganization) {
            await this.doSubmitNew();
        } else {
            await this.doSubmitExisting();
        }
    }

    async doSubmitNew() {
        // TODO: new families organization submit
    }

    async doSubmitExisting() {
        try {
            const request = new OrganizationSponsorshipRedeemRequest();
            request.planSponsorshipType = PlanSponsorshipType.FamiliesForEnterprise;
            request.sponsoredOrganizationId = this.selectedFamilyOrganizationId;

            await this.apiService.postRedeemSponsorship(this.token, request);
            this.toasterService.popAsync('success', null, this.i18nService.t('sponsoredFamiliesOfferRedeemed'));
            await this.syncService.fullSync(true);

            this.router.navigate(['/']);
        } catch (e) {
            this.validationService.showError(e);
        }
    }

    get anyOrgsAvailable() {
        return this.existingFamilyOrganizations.length > 0;
    }
}
