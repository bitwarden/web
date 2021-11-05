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
    availableSponsoshipOrgs: Organization[];
    activeSponsorshipsOrgs: Organization[];
    selectedSponsorshipOrgId: string = "";
    sponsorshipEmail: string  = "";

    // Conditional display properties
    moreThanOneOrgSponsored: boolean;
    moreThanOneOrgAvailable: boolean;
    anyOrgsAvailable: boolean;

    formPromise: Promise<any>;

    public constructor(private userService: UserService) { }

    public async ngOnInit() {
        
        const allOrgs = await this.userService.getAllOrganizations();

        // TODO: Filter out organizations that can't do sponsorships
        this.availableSponsoshipOrgs = allOrgs.filter(org => true);
        this.activeSponsorshipsOrgs = allOrgs.filter(org => true);

        // Auto select the org if there is only one
        if (this.availableSponsoshipOrgs.length === 1) {
            this.selectedSponsorshipOrgId = this.availableSponsoshipOrgs[0].id;
            this.moreThanOneOrgAvailable = false;
            this.anyOrgsAvailable = true;
        }

        if (this.activeSponsorshipsOrgs.length > 1) {
            this.moreThanOneOrgSponsored = true;
        }

        console.log(this.availableSponsoshipOrgs);
        console.log(this.activeSponsorshipsOrgs);
    }

    public async submit() {
        // TODO: Validate form and submit
    }
}