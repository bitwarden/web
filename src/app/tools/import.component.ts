import {
    Component,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';

import { BitwardenCsvImporter } from 'jslib/importers/bitwardenCsvImporter';
import { Importer } from 'jslib/importers/importer';
import { KeePassXCsvImporter } from 'jslib/importers/keepassxCsvImporter';
import { LastPassCsvImporter } from 'jslib/importers/lastpassCsvImporter';

@Component({
    selector: 'app-import',
    templateUrl: 'import.component.html',
})
export class ImportComponent {
    featuredImportOptions: any[];
    importOptions: any[];
    format: string = null;
    fileContents: string;

    constructor(private i18nService: I18nService, protected analytics: Angulartics2,
        protected toasterService: ToasterService) {
        const bw = new BitwardenCsvImporter();
        const lp = new LastPassCsvImporter();

        this.featuredImportOptions = [
            { id: null, name: '-- ' + i18nService.t('select') + ' --' },
            { id: 'bitwardencsv', name: 'Bitwarden (csv)' },
            { id: 'lastpasscsv', name: 'LastPass (csv)' },
            { id: 'chromecsv', name: 'Chrome (csv)' },
            { id: 'firefoxcsv', name: 'Firefox (csv)' },
            { id: 'keepass2xml', name: 'KeePass 2 (xml)' },
            { id: '1password1pif', name: '1Password (1pif)' },
            { id: 'dashlanecsv', name: 'Dashlane (csv)' },
        ];

        this.importOptions = [
            { id: 'keepassxcsv', name: 'KeePassX (csv)' },
            { id: '1password6wincsv', name: '1Password 6 Windows (csv)' },
            { id: 'roboformcsv', name: 'RoboForm (csv)' },
            { id: 'keepercsv', name: 'Keeper (csv)' },
            { id: 'enpasscsv', name: 'Enpass (csv)' },
            { id: 'safeincloudxml', name: 'SafeInCloud (xml)' },
            { id: 'pwsafexml', name: 'Password Safe (xml)' },
            { id: 'stickypasswordxml', name: 'Sticky Password (xml)' },
            { id: 'msecurecsv', name: 'mSecure (csv)' },
            { id: 'truekeycsv', name: 'True Key (csv)' },
            { id: 'passwordbossjson', name: 'Password Boss (json)' },
            { id: 'zohovaultcsv', name: 'Zoho Vault (csv)' },
            { id: 'splashidcsv', name: 'SplashID (csv)' },
            { id: 'passworddragonxml', name: 'Password Dragon (xml)' },
            { id: 'padlockcsv', name: 'Padlock (csv)' },
            { id: 'clipperzhtml', name: 'Clipperz (html)' },
            { id: 'avirajson', name: 'Avira (json)' },
            { id: 'saferpasscsv', name: 'SaferPass (csv)' },
            { id: 'upmcsv', name: 'Universal Password Manager (csv)' },
            { id: 'ascendocsv', name: 'Ascendo DataVault (csv)' },
            { id: 'meldiumcsv', name: 'Meldium (csv)' },
            { id: 'passkeepcsv', name: 'PassKeep (csv)' },
            { id: 'operacsv', name: 'Opera (csv)' },
            { id: 'vivaldicsv', name: 'Vivaldi (csv)' },
            { id: 'gnomejson', name: 'GNOME Passwords and Keys/Seahorse (json)' },
        ].sort((a, b) => {
            if (a.name == null && b.name != null) {
                return -1;
            }
            if (a.name != null && b.name == null) {
                return 1;
            }
            if (a.name == null && b.name == null) {
                return 0;
            }

            return this.i18nService.collator ? this.i18nService.collator.compare(a.name, b.name) :
                a.name.localeCompare(b.name);
        });
    }

    async submit() {
        const importer = this.getImporter();
        if (importer === null) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectFormat'));
            return;
        }

        const fileEl = document.getElementById('file') as HTMLInputElement;
        const files = fileEl.files;
        if ((files == null || files.length === 0) && (this.fileContents == null || this.fileContents === '')) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectFile'));
            return;
        }

        let fileContents = this.fileContents;
        if (files != null && files.length > 0) {
            try {
                const content = await this.getFileContents(files[0]);
                if (content != null) {
                    fileContents = content;
                }
            } catch { }
        }

        if (fileContents == null || fileContents === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('selectFile'));
            return;
        }

        const importResult = await importer.parse(fileContents);
        console.log(importResult);
        if (importResult.success) {

        } else {

        }
    }

    private getFileContents(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = (evt) => {
                if (this.format === 'lastpasscsv' && file.type === 'text/html') {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(evt.target.result, 'text/html');
                    const pre = doc.querySelector('pre');
                    if (pre != null) {
                        resolve(pre.textContent);
                        return;
                    }
                    reject();
                    return;
                }

                resolve(evt.target.result);
            };
            reader.onerror = () => {
                reject();
            };
        });
    }

    private getImporter(): Importer {
        if (this.format == null || this.format === '') {
            return null;
        }

        switch (this.format) {
            case 'bitwardencsv':
                return new BitwardenCsvImporter();
            case 'lastpasscsv':
                return new LastPassCsvImporter();
            case 'keepassxcsv':
                return new KeePassXCsvImporter();
            default:
                return null;
        }
    }
}
