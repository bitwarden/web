import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-options',
    templateUrl: 'options.component.html',
})
export class OptionsComponent implements OnInit {
    vaultTimeout: number = null;
    vaultTimeoutAction: string = 'lock';
    disableIcons: boolean;
    enableGravatars: boolean;
    enableFullWidth: boolean;
    theme: string;
    locale: string;
    vaultTimeouts: any[];
    localeOptions: any[];
    themeOptions: any[];

    private startingLocale: string;

    constructor(private storageService: StorageService, private stateService: StateService,
        private i18nService: I18nService, private toasterService: ToasterService,
        private vaultTimeoutService: VaultTimeoutService, private platformUtilsService: PlatformUtilsService,
        private messagingService: MessagingService) {
        this.vaultTimeouts = [
            { name: i18nService.t('oneMinute'), value: 1 },
            { name: i18nService.t('fiveMinutes'), value: 5 },
            { name: i18nService.t('fifteenMinutes'), value: 15 },
            { name: i18nService.t('thirtyMinutes'), value: 30 },
            { name: i18nService.t('oneHour'), value: 60 },
            { name: i18nService.t('fourHours'), value: 240 },
            { name: i18nService.t('onRefresh'), value: -1 },
        ];
        if (this.platformUtilsService.isDev()) {
            this.vaultTimeouts.push({ name: i18nService.t('never'), value: null });
        }

        const localeOptions: any[] = [];
        i18nService.supportedTranslationLocales.forEach(locale => {
            let name = locale;
            if (i18nService.localeNames.has(locale)) {
                name += (' - ' + i18nService.localeNames.get(locale));
            }
            localeOptions.push({ name: name, value: locale });
        });
        localeOptions.sort(Utils.getSortFunction(i18nService, 'name'));
        localeOptions.splice(0, 0, { name: i18nService.t('default'), value: null });
        this.localeOptions = localeOptions;
        this.themeOptions = [
            { name: i18nService.t('themeDefault'), value: 'theme_defaultSet' },
            { name: i18nService.t('themeLight'), value: 'theme_light' },
            { name: i18nService.t('themeDark'), value: 'theme_dark' },
        ];
    }

    async ngOnInit() {
        this.vaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
        this.vaultTimeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
        this.disableIcons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.enableGravatars = await this.storageService.get<boolean>('enableGravatars');
        this.enableFullWidth = await this.storageService.get<boolean>('enableFullWidth');
        this.locale = this.startingLocale = await this.storageService.get<string>(ConstantsService.localeKey);
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
    }

    async submit() {
        await this.vaultTimeoutService.setVaultTimeoutOptions(this.vaultTimeout != null ? this.vaultTimeout : null,
            this.vaultTimeoutAction);
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.storageService.save('enableGravatars', this.enableGravatars);
        await this.stateService.save('enableGravatars', this.enableGravatars);
        await this.storageService.save('enableFullWidth', this.enableFullWidth);
        this.messagingService.send('setFullWidth');
        await this.storageService.save('theme', this.theme);
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        if (this.locale !== this.startingLocale) {
            window.location.reload();
        } else {
            this.toasterService.popAsync('success', null, this.i18nService.t('optionsUpdated'));
        }
    }

    async vaultTimeoutActionChanged(newValue: string) {
        if (newValue === 'logOut') {
            const confirmed = await this.platformUtilsService.showDialog(
                this.i18nService.t('vaultTimeoutLogOutConfirmation'),
                this.i18nService.t('vaultTimeoutLogOutConfirmationTitle'),
                this.i18nService.t('yes'), this.i18nService.t('cancel'), 'warning');
            if (!confirmed) {
                this.vaultTimeoutAction = 'lock';
                return;
            }
        }
        this.vaultTimeoutAction = newValue;
    }

    async themeChanged(themeUpdate: string) {
        const theme = ['theme_defaultSet', 'theme_dark', 'theme_light'];
        const htmlEl = window.document.documentElement;
        theme.forEach(element => {
            htmlEl.classList.remove(element);
        });
        if (themeUpdate === 'theme_defaultSet') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                htmlEl.classList.add('theme_dark', themeUpdate);
            }
            if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                htmlEl.classList.add('theme_light', themeUpdate);
            }
        } else {
            htmlEl.classList.add(themeUpdate);
        }
    }
}
