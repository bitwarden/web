import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-options',
    templateUrl: 'options.component.html',
})
export class OptionsComponent implements OnInit {
    lockOption: number = null;
    disableIcons: boolean;
    enableGravatars: boolean;
    locale: string;
    lockOptions: any[];
    localeOptions: any[];

    private startingLocale: string;

    constructor(private storageService: StorageService, private stateService: StateService,
        private analytics: Angulartics2, private i18nService: I18nService,
        private toasterService: ToasterService, private lockService: LockService,
        private platformUtilsService: PlatformUtilsService) {
        this.lockOptions = [
            { name: i18nService.t('oneMinute'), value: 1 },
            { name: i18nService.t('fiveMinutes'), value: 5 },
            { name: i18nService.t('fifteenMinutes'), value: 15 },
            { name: i18nService.t('thirtyMinutes'), value: 30 },
            { name: i18nService.t('oneHour'), value: 60 },
            { name: i18nService.t('fourHours'), value: 240 },
            { name: i18nService.t('onRefresh'), value: -1 },
        ];
        if (this.platformUtilsService.isDev()) {
            this.lockOptions.push({ name: i18nService.t('never'), value: null });
        }

        const localeOptions: any[] = [];
        i18nService.supportedTranslationLocales.forEach((locale) => {
            localeOptions.push({ name: locale, value: locale });
        });
        localeOptions.sort(Utils.getSortFunction(i18nService, 'name'));
        localeOptions.splice(0, 0, { name: i18nService.t('default'), value: null });
        this.localeOptions = localeOptions;
    }

    async ngOnInit() {
        this.lockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        this.disableIcons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.enableGravatars = await this.storageService.get<boolean>('enableGravatars');
        this.locale = this.startingLocale = await this.storageService.get<string>(ConstantsService.localeKey);
    }

    async submit() {
        await this.lockService.setLockOption(this.lockOption != null ? this.lockOption : null);
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.storageService.save('enableGravatars', this.enableGravatars);
        await this.stateService.save('enableGravatars', this.enableGravatars);
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Saved Options' });
        if (this.locale !== this.startingLocale) {
            window.location.reload();
        } else {
            this.toasterService.popAsync('success', null, this.i18nService.t('optionsUpdated'));
        }
    }
}
