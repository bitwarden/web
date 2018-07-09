import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
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

    private startingLocale: string;

    constructor(private storageService: StorageService, private stateService: StateService,
        private analytics: Angulartics2, private i18nService: I18nService,
        private toasterService: ToasterService) {
        this.localeOptions = [{ name: i18nService.t('default'), value: null }];
        i18nService.supportedTranslationLocales.forEach((locale) => {
            this.localeOptions.push({ name: locale, value: locale });
        });
    }

    async ngOnInit() {
        this.disableIcons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.locale = this.startingLocale = await this.storageService.get<string>(ConstantsService.localeKey);
    }

    async submit() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Saved Options' });
        if (this.locale !== this.startingLocale) {
            window.location.reload();
        } else {
            this.toasterService.popAsync('success', null, this.i18nService.t('optionsUpdated'));
        }
    }
}
