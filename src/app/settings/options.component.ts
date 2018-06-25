import {
    Component,
    OnInit,
} from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

@Component({
    selector: 'app-options',
    templateUrl: 'options.component.html',
})
export class OptionsComponent implements OnInit {
    disableIcons: boolean;
    locale: string;
    localeOptions: any[];

    constructor(private storageService: StorageService, private stateService: StateService,
        private analytics: Angulartics2, i18nService: I18nService) {
        this.localeOptions = [{ name: i18nService.t('default'), value: null }];
        i18nService.supportedTranslationLocales.forEach((locale) => {
            this.localeOptions.push({ name: locale, value: locale });
        });
    }

    async ngOnInit() {
        this.disableIcons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.locale = await this.storageService.get<string>(ConstantsService.localeKey);
    }

    async saveIcons() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        this.callAnalytics('Website Icons', !this.disableIcons);
    }

    async saveLocale() {
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Set Locale ' + this.locale });
        window.location.reload();
    }

    private callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.analytics.eventTrack.next({ action: `${status} ${name}` });
    }

}
