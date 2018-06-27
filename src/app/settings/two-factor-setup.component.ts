import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { TwoFactorProviders } from 'jslib/services/auth.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

@Component({
    selector: 'app-two-factor-setup',
    templateUrl: 'two-factor-setup.component.html',
})
export class TwoFactorSetupComponent implements OnInit {
    providers: any[] = [];
    premium: boolean;
    loading = true;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private tokenService: TokenService) { }

    async ngOnInit() {
        this.premium = this.tokenService.getPremium();

        for (const key in TwoFactorProviders) {
            if (!TwoFactorProviders.hasOwnProperty(key)) {
                continue;
            }

            const p = (TwoFactorProviders as any)[key];
            if (p.type === TwoFactorProviderType.OrganizationDuo) {
                continue;
            }

            this.providers.push({
                type: p.type,
                name: p.name,
                description: p.description,
                enabled: false,
                premium: p.premium,
                sort: p.sort,
            });
        }

        this.providers.sort((a: any, b: any) => a.sort - b.sort);
        await this.load();
    }

    async load() {
        this.loading = true;
        const providerList = await this.apiService.getTwoFactorProviders();
        providerList.data.forEach((p) => {
            this.providers.forEach((p2) => {
                if (p.type === p2.type) {
                    p2.enabled = p.enabled;
                }
            });
        });
        this.loading = false;
    }
}
