import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

@Component({
    selector: 'app-themed-image',
    templateUrl: 'themed-image.component.html',
})

export class ThemedImageComponent implements OnInit {
    @Input() class: string;
    @Input() alt: string;
    @Input() darkThemeImage: string;
    @Input() lightThemeImage: string;

    src: string;
    theme: string;

    constructor(private storageService: StorageService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
        if (this.theme == null) {
            const systemTheme = await this.platformUtilsService.getDefaultSystemTheme();
            if (systemTheme === 'light') {
                this.src = this.lightThemeImage;
            }
            if (systemTheme === 'dark') {
                this.src = this.darkThemeImage;
            }
        }
        this.platformUtilsService.onDefaultSystemThemeChange(async sysTheme => {
            const bwTheme = await this.storageService.get<string>(ConstantsService.themeKey);
            if (bwTheme == null) {
                if (sysTheme === 'light') {
                    this.src = this.lightThemeImage;
                }
                if (this.theme === 'dark') {
                    this.src = this.darkThemeImage;
                }
            }
        });
        if (this.theme === 'light') {
            this.src = this.lightThemeImage;
        }
        if (this.theme === 'dark') {
            this.src = this.darkThemeImage;
        }
    }
}
