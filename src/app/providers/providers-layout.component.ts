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

import { ProviderResponse } from 'jslib-common/models/response/providerResponse';

@Component({
    selector: 'providers-layout',
    templateUrl: 'providers-layout.component.html',
})
export class ProvidersLayoutComponent {

    provider: ProviderResponse;
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
        // TODO: Implement
    }

}

