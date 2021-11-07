import {
    Component,
    OnInit,
} from '@angular/core';
import { UserService } from 'jslib-common/abstractions/user.service';
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

    constructor(private userService: UserService) { }

    async ngOnInit() {

        const allOrgs = await this.userService.getAllOrganizations();

        // TODO: Filter out organizations that can't do sponsorships
        this.availableSponsorshipOrgs = allOrgs.filter(org => true);

        // TODO: I don't think this will be a filter but it's own call
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

        console.log({anyOrgsAvailable: this.anyOrgsAvailable,
            moreThanOneOrgAvailable: this.moreThanOneOrgAvailable,
            anyActiveSponsorships: this.anyActiveSponsorships});
    }

    async removeSponsorship(org: Organization) {
        console.log('Remove Sponsorship: ', org);
    }

    async submit() {
        // TODO: Validate form and submit
        // It seems like email validation is done on the server side
        console.log('Form Items: ', { 
            selectedSponsorshipOrgId: this.selectedSponsorshipOrgId, 
            sponsorshipEmail: this.sponsorshipEmail,
        });
    }
}