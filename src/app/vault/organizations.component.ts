import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-vault-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent {
    @Output() onOrganizationClicked = new EventEmitter<Organization>();
    organizations: Organization[];
    loaded: boolean = false;

    constructor(private userService: UserService) {
    }

    async load() {
        this.organizations = await this.userService.getAllOrganizations();
        this.loaded = true;
    }

    selectOrganization(o: Organization) {
        this.onOrganizationClicked.emit(o);
    }
}
