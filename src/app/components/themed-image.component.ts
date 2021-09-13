import {
    Component,
    Input,
    OnChanges,
    OnInit,
} from '@angular/core';

import { StorageService } from 'jslib-common/abstractions/storage.service';

import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';

import { ConsoleLogService } from 'jslib-common/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';

import { BroadcasterMessagingService } from '../../services/broadcasterMessaging.service';
import { I18nService } from '../../services/i18n.service';
import { WebPlatformUtilsService } from '../../services/webPlatformUtils.service';

const broadcasterService = new BroadcasterService();
const consoleLogService = new ConsoleLogService(false);
const i18nService = new I18nService(window.navigator.language, 'locales');
const messagingService = new BroadcasterMessagingService(broadcasterService);
const platformUtilsService = new WebPlatformUtilsService(i18nService, messagingService, consoleLogService);

@Component({
    selector: 'app-themed-image',
    templateUrl: 'themed-image.component.html',
})

export class ThemedImageComponent implements OnInit {
    @Input() image: string;
    @Input() class: string;
    @Input() alt: string;

    theme: string;
    themedImage: string;

    darkThemeLogo = '/src/images/logo-white@2x.png';
    lightThemeLogo = '/src/images/logo-dark@2x.png';
    darkThemeRegisterLogo = '/src/images/register-layout/logo-horizontal-white.png';
    lightThemeRegisterLogo = '/src/images/register-layout/logo-horizontal-white.png';

    constructor(private storageService: StorageService) { }

    async ngOnInit() {
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
        if (this.theme == null) {
            const systemTheme = await platformUtilsService.getDefaultSystemTheme();
            if (systemTheme === 'light') {
                if (this.image === 'logo') {
                    this.themedImage = this.lightThemeLogo;
                }
                if (this.image === 'registerLogo') {
                    this.themedImage = this.lightThemeRegisterLogo;
                }
            } else {
                if (this.image === 'logo') {
                    this.themedImage = this.darkThemeLogo;
                }
                if (this.image === 'registerLogo') {
                    this.themedImage = this.darkThemeRegisterLogo;
                }
            }
        } else if (this.theme === 'light') {
            if (this.image === 'logo') {
                this.themedImage = this.lightThemeLogo;
            }
            if (this.image === 'registerLogo') {
                this.themedImage = this.lightThemeRegisterLogo;
            }
        } else {
            if (this.image === 'logo') {
                this.themedImage = this.darkThemeLogo;
            }
            if (this.image === 'registerLogo') {
                this.themedImage = this.darkThemeRegisterLogo;
            }
        }
    }

    async ngOnChanges() {
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
        platformUtilsService.onDefaultSystemThemeChange(async sysTheme => {
            const bwTheme = await this.storageService.get<string>(ConstantsService.themeKey);
            if (bwTheme == null) {
                if (sysTheme === 'light') {
                    if (this.image === 'logo') {
                        this.themedImage = this.lightThemeLogo;
                    }
                    if (this.image === 'registerLogo') {
                        this.themedImage = this.lightThemeRegisterLogo;
                    }
                } else {
                    if (this.image === 'logo') {
                        this.themedImage = this.darkThemeLogo;
                    }
                    if (this.image === 'registerLogo') {
                        this.themedImage = this.darkThemeRegisterLogo;
                    }
                }
            }
        });
        if (this.theme === 'light') {
            if (this.image === 'logo') {
                this.themedImage = this.lightThemeLogo;
            }
            if (this.image === 'registerLogo') {
                this.themedImage = this.lightThemeRegisterLogo;
            }
        } else {
            if (this.image === 'logo') {
                this.themedImage = this.darkThemeLogo;
            }
            if (this.image === 'registerLogo') {
                this.themedImage = this.darkThemeRegisterLogo;
            }
        }
    }
}
