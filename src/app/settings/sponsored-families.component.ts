import {
    Component,
    OnInit,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { PlanSponsorshipType } from 'jslib-common/enums/planSponsorshipType';
import { Organization } from 'jslib-common/models/domain/organization';

@Component({
    selector: 'app-sponsored-families',
    templateUrl: 'sponsored-families.component.html',
})
export class SponsoredFamiliesComponent implements OnInit {
    availableSponsorshipOrgs: Organization[];
    // TODO: I think this will be a different model
    activeSponsorshipOrgs: Organization[];
    selectedSponsorshipOrgId: string = '';
    sponsorshipEmail: string  = '';

    // Conditional display properties
    anyActiveSponsorships: boolean;
    moreThanOneOrgAvailable: boolean;
    anyOrgsAvailable: boolean;

    formPromise: Promise<any>;

    constructor(private userService: UserService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private toasterService: ToasterService, private logService: LogService) { }

    async ngOnInit() {
        await this.load();
    }

    private async load() {
        const allOrgs = await this.userService.getAllOrganizations();

        // TODO: Filter out organizations that can't do sponsorships
        this.availableSponsorshipOrgs = allOrgs.filter(org => true);

        // TODO: I don't think this will be a filter but its own call
        this.activeSponsorshipOrgs = allOrgs.filter(org => true);

        if (this.availableSponsorshipOrgs.length > 0) {
            this.anyOrgsAvailable = true;
            this.moreThanOneOrgAvailable = this.availableSponsorshipOrgs.length > 1;

            if (this.availableSponsorshipOrgs.length === 1) {
                this.selectedSponsorshipOrgId = this.availableSponsorshipOrgs[0].id;
            }
        }

        if (this.activeSponsorshipOrgs.length > 0) {
            this.anyActiveSponsorships = true;
        }
    }

    async removeSponsorship(org: Organization) {
        const isConfirmed = await this.platformUtilsService.showDialog(
            'Are you sure you want to remove this sponsorship?', 'test@email.com',
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!isConfirmed) {
            return;
        }

        try {
            // TODO: Remove sponsorship

            this.toasterService.popAsync('success', null, 'Sponsorship Removed');
            this.load();
        } catch (e) {
            this.logService.error(e);
        }

    }

    async submit() {
        await this.apiService.postCreateSponsorship(this.selectedSponsorshipOrgId, {
            sponsoredEmail: this.sponsorshipEmail,
            planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
            organizationUserId: await this.userService.getUserId(),
        });
    }
}