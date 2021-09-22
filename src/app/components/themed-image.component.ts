import {
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

@Component({
    selector: 'app-themed-image',
    templateUrl: 'themed-image.component.html',
})
export class ThemedImageComponent implements OnInit, OnDestroy {
    @Input() imageClass: string;
    @Input() imageAlt: string;
    @Input() darkThemeImage: string;
    @Input() lightThemeImage: string;

    imageUrl: string;

    private themeChangeCallback: any;
    private prefersColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)');

    constructor(private storageService: StorageService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        const theme = await this.platformUtilsService.getEffectiveTheme();

        this.imageUrl = theme === 'dark' ? this.darkThemeImage : this.lightThemeImage;

        this.themeChangeCallback = async (prefersDarkQuery: MediaQueryList) => {
            const bwTheme = await this.storageService.get<string>(ConstantsService.themeKey);
            if (bwTheme == 'system') {
                this.imageUrl = prefersDarkQuery.matches ? this.darkThemeImage : this.lightThemeImage;
            }
        };
        this.prefersColorSchemeDark.addEventListener('change', this.themeChangeCallback);
    }

    ngOnDestroy() {
        this.prefersColorSchemeDark.removeEventListener('change', this.themeChangeCallback);
    }
}
