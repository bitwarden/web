import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { ProviderService } from 'jslib-common/abstractions/provider.service';

@Injectable()
export class ProviderGuardService implements CanActivate {
    constructor(private providerService: ProviderService, private router: Router,
        private toasterService: ToasterService, private i18nService: I18nService) { }

    async canActivate(route: ActivatedRouteSnapshot) {
        const provider = await this.providerService.get(route.params.providerId);
        if (provider == null) {
            this.router.navigate(['/']);
            return false;
        }
        if (!provider.isProviderAdmin && !provider.enabled) {
            this.toasterService.popAsync('error', null, this.i18nService.t('providerIsDisabled'));
            this.router.navigate(['/']);
            return false;
        }

        return true;
    }
}
