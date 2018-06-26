import {
    Component,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { CipherRequest } from 'jslib/models/request/cipherRequest';
import { FolderRequest } from 'jslib/models/request/folderRequest';
import { ImportCiphersRequest } from 'jslib/models/request/importCiphersRequest';
import { KvpRequest } from 'jslib/models/request/kvpRequest';

import { AviraCsvImporter } from 'jslib/importers/aviraCsvImporter';
import { BitwardenCsvImporter } from 'jslib/importers/bitwardenCsvImporter';
import { Importer } from 'jslib/importers/importer';
import { KeePassXCsvImporter } from 'jslib/importers/keepassxCsvImporter';
import { LastPassCsvImporter } from 'jslib/importers/lastpassCsvImporter';
import { CipherView } from 'jslib/models/view';

@Component({
    selector: 'app-import',
    templateUrl: 'import.component.html',
})
export class ImportComponent {
    featuredImportOptions: any[];
    importOptions: any[];
    format: string = null;
    fileContents: string;

    formPromise: Promise<any>;

    constructor(private i18nService: I18nService, private analytics: Angulartics2,
        private toasterService: ToasterService, private cipherService: CipherService,
        private folderService: FolderService, private apiService: ApiService,
        private router: Router) {
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
            { id: 'aviracsv', name: 'Avira (csv)' },
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
        if (importResult.success) {
            if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
                this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                    this.i18nService.t('importNothingError'));
                return;
            } else if (importResult.ciphers.length > 0) {
                const halfway = Math.floor(importResult.ciphers.length / 2);
                const last = importResult.ciphers.length - 1;
                if (this.badData(importResult.ciphers[0]) && this.badData(importResult.ciphers[halfway]) &&
                    this.badData(importResult.ciphers[last])) {
                    this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                        this.i18nService.t('importFormatError'));
                    return;
                }
            }

            const request = new ImportCiphersRequest();
            for (let i = 0; i < importResult.ciphers.length; i++) {
                const c = await this.cipherService.encrypt(importResult.ciphers[i]);
                request.ciphers.push(new CipherRequest(c));
            }
            for (let i = 0; i < importResult.folders.length; i++) {
                const f = await this.folderService.encrypt(importResult.folders[i]);
                request.folders.push(new FolderRequest(f));
            }
            importResult.folderRelationships.forEach((v: number, k: number) =>
                request.folderRelationships.push(new KvpRequest(k, v)));

            try {
                this.formPromise = this.apiService.postImportCiphers(request);
                await this.formPromise;
                this.toasterService.popAsync('success', null, this.i18nService.t('importSuccess'));
                this.router.navigate(['vault']);
            } catch { }
        } else {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('importFormatError'));
        }
    }

    getFormatInstructionTitle() {
        if (this.format == null) {
            return null;
        }

        const results = this.featuredImportOptions.concat(this.importOptions).filter((o) => o.id === this.format);
        if (results.length > 0) {
            return this.i18nService.t('instructionsFor', results[0].name);
        }
        return null;
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
            case 'aviracsv':
                return new AviraCsvImporter();
            default:
                return null;
        }
    }

    private badData(c: CipherView) {
        return (c.name == null || c.name === '--') &&
            (c.login != null && (c.login.password == null || c.login.password === ''));
    }
}
