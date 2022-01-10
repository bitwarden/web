import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { ProviderService } from 'jslib-common/abstractions/provider.service';

@Component({
    selector: 'provider-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent {
    constructor(private route: ActivatedRoute, private providerService: ProviderService,
        private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async params => {
            const provider = await this.providerService.get(params.providerId);
        });
    }
}
