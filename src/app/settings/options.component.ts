import {
    Component,
    OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StateService } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { ThemeType } from 'jslib-common/enums/themeType';
import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-options',
    templateUrl: 'options.component.html',
})
export class OptionsComponent implements OnInit {
    vaultTimeoutAction: string = 'lock';
    disableIcons: boolean;
    enableGravatars: boolean;
    enableFullWidth: boolean;
    theme: string = null;
    locale: string;
    vaultTimeouts: { name: string; value: number; }[];
    localeOptions: any[];
    themeOptions: any[];

    vaultTimeout: FormControl = new FormControl(null);

    private startingLocale: string;
    private startingTheme: string;

    constructor(private storageService: StorageService, private stateService: StateService,
        private i18nService: I18nService,
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
            { name: i18nService.t('themeLight'), value: null },
            { name: i18nService.t('themeDark'), value: ThemeType.Dark },
            { name: i18nService.t('themeSystem'), value: ThemeType.System },
        ];
    }

    async ngOnInit() {
        this.vaultTimeout.setValue(await this.vaultTimeoutService.getVaultTimeout());
        this.vaultTimeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
        this.disableIcons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.enableGravatars = await this.storageService.get<boolean>('enableGravatars');
        this.enableFullWidth = await this.storageService.get<boolean>('enableFullWidth');
        this.locale = this.startingLocale = await this.storageService.get<string>(ConstantsService.localeKey);
        this.theme = this.startingTheme = await this.storageService.get<ThemeType>(ConstantsService.themeKey);
    }

    async submit() {
        if (!this.vaultTimeout.valid) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('vaultTimeoutToLarge'));
            return;
        }

        await this.vaultTimeoutService.setVaultTimeoutOptions(this.vaultTimeout.value, this.vaultTimeoutAction);
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableIcons);
        await this.storageService.save('enableGravatars', this.enableGravatars);
        await this.stateService.save('enableGravatars', this.enableGravatars);
        await this.storageService.save('enableFullWidth', this.enableFullWidth);
        this.messagingService.send('setFullWidth');
        if (this.theme !== this.startingTheme) {
            await this.storageService.save(ConstantsService.themeKey, this.theme);
            this.startingTheme = this.theme;
            const effectiveTheme = await this.platformUtilsService.getEffectiveTheme();
            const htmlEl = window.document.documentElement;
            htmlEl.classList.remove('theme_' + ThemeType.Light, 'theme_' + ThemeType.Dark);
            htmlEl.classList.add('theme_' + effectiveTheme);
        }
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        if (this.locale !== this.startingLocale) {
            window.location.reload();
        } else {
            this.platformUtilsService.showToast('success', null, [this.i18nService.t('optionsUpdated'), this.i18nService.t('optionsUpdated')]);
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
}
