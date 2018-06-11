import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-vault-organizations',
    templateUrl: 'organizations.component.html',
})
export class OrganizationsComponent {
    @Output() onOrganizationClicked = new EventEmitter<any>();
    organizations: any;

    constructor(private userService: UserService, private analytics: Angulartics2,
        private toasterService: ToasterService) {
    }

    async load() {
        this.organizations = await this.userService.getAllOrganizations();
    }

    selectOrganization(o: any) {
        this.onOrganizationClicked.emit(0);
    }
}
