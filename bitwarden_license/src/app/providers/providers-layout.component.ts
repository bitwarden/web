import {
    Component,
    NgZone,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

@Component({
    selector: 'providers-layout',
    templateUrl: 'providers-layout.component.html',
})
export class ProvidersLayoutComponent {

    provider: Provider;
    private providerId: string;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private apiService: ApiService, private platformUtilsService: PlatformUtilsService,
        private environmentService: EnvironmentService) { }


    ngOnInit() {
        document.body.classList.remove('layout_frontend');
        this.route.params.subscribe(async params => {
            this.providerId = params.providerId;
            await this.load();
        });
    }

    async load() {
        this.provider = await this.userService.getProvider(this.providerId);
    }

    get showMenuBar() {
        return true; // TODO: Replace with permissions
    }

    get manageRoute(): string {
        return 'manage';
        /*
        let route: string;
        switch (true) {
            case this.provider.canManageUsers:
                route = 'manage/people';
                break;
            case this.organization.canManageAssignedCollections || this.organization.canManageAllCollections:
                route = 'manage/collections';
                break;
            case this.organization.canManageGroups:
                route = 'manage/groups';
                break;
            case this.organization.canManagePolicies:
                route = 'manage/policies';
                break;
            case this.organization.canAccessEventLogs:
                route = 'manage/events';
                break;
        }
        return route;
        */
    }
}

