import {
    Component,
    OnInit,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
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
    sponsorshipEmail: string = '';
    friendlyName: string = '';

    // Conditional display properties

    formPromise: Promise<any>;
    revokePromise: Promise<any>;

    constructor(private userService: UserService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private toasterService: ToasterService, private logService: LogService,
        private syncService: SyncService) { }

    async ngOnInit() {
        await this.load();
    }

    async resendEmail(org: Organization) {
        this.toasterService.popAsync('success', null, '[WIP] Should send email');
    }

    async removeSponsorship(org: Organization) {
        try {
            this.revokePromise = this.doRemoveSponsorship(org);
            await this.revokePromise;
        } catch (e) {
            this.logService.error(e);
        }
    }

    async doRemoveSponsorship(org: Organization) {
        const isConfirmed = await this.platformUtilsService.showDialog(
            'Are you sure you want to remove this sponsorship?', org.familySponsorshipFriendlyName,
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');

        if (!isConfirmed) {
            return;
        }

        await this.apiService.deleteRevokeSponsorship(org.id);
        await this.load(true);
        this.toasterService.popAsync('success', null, this.i18nService.t('reclaimedFreePlan'));
    }

    async submit() {
        this.formPromise = this.apiService.postCreateSponsorship(this.selectedSponsorshipOrgId, {
            sponsoredEmail: this.sponsorshipEmail,
            planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
            friendlyName: this.friendlyName,
        });

        await this.formPromise;
        await this.load(true);
    }

    private async load(forceReload: boolean = false) {
        if (forceReload) {
            this.syncService.fullSync(true);
        }

        const allOrgs = await this.userService.getAllOrganizations();
        this.availableSponsorshipOrgs = allOrgs.filter(org => org.familySponsorshipAvailable);

        this.activeSponsorshipOrgs = allOrgs.filter(org => org.familySponsorshipFriendlyName !== null);

        if (this.availableSponsorshipOrgs.length === 1) {
            this.selectedSponsorshipOrgId = this.availableSponsorshipOrgs[0].id;
        }
    }

    get anyActiveSponsorships(): boolean {
        return this.activeSponsorshipOrgs.length > 0;
    }

    get anyOrgsAvailable(): boolean {
        return this.availableSponsorshipOrgs.length > 0;
    }

    get moreThanOneOrgAvailable(): boolean {
        return this.availableSponsorshipOrgs.length > 1;
    }
}
