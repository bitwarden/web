import {
    Component,
    OnInit,
} from '@angular/core';

import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

@Component({
    selector: 'app-vault-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent implements OnInit {
    organizations: Organization[];
    loaded: boolean = false;

    constructor(private userService: UserService) { }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        this.organizations = await this.userService.getAllOrganizations();
        this.loaded = true;
    }
}
