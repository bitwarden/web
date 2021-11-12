import {
    Component,
    OnInit,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
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
    loading = false;

    availableSponsorshipOrgs: Organization[] = [];
    activeSponsorshipOrgs: Organization[] = [];
    selectedSponsorshipOrgId: string = '';
    sponsorshipEmail: string = '';
    friendlyName: string = '';

    // Conditional display properties
    formPromise: Promise<any>;

    constructor(private userService: UserService, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private toasterService: ToasterService, private syncService: SyncService) { }

    async ngOnInit() {
        await this.load();
    }

    async submit() {
        this.formPromise = this.apiService.postCreateSponsorship(this.selectedSponsorshipOrgId, {
            sponsoredEmail: this.sponsorshipEmail,
            planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
            friendlyName: this.friendlyName,
        });

        await this.formPromise;
        this.toasterService.popAsync('success', null, this.i18nService.t('sponsorshipCreated'));
        this.formPromise = null;
        this.resetForm();
        await this.load(true);
    }

    async load(forceReload: boolean = false) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        if (forceReload) {
            await this.syncService.fullSync(true);
        }

        const allOrgs = await this.userService.getAllOrganizations();
        this.availableSponsorshipOrgs = allOrgs.filter(org => org.familySponsorshipAvailable);

        this.activeSponsorshipOrgs = allOrgs.filter(org => org.familySponsorshipFriendlyName !== null);

        if (this.availableSponsorshipOrgs.length === 1) {
            this.selectedSponsorshipOrgId = this.availableSponsorshipOrgs[0].id;
        }
        this.loading = false;
    }


    private async resetForm() {
        this.sponsorshipEmail = '';
        this.friendlyName = '';
        this.selectedSponsorshipOrgId = '';
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
