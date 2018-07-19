import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { ImportResult } from 'jslib/models/domain/importResult';

import { CipherRequest } from 'jslib/models/request/cipherRequest';
import { FolderRequest } from 'jslib/models/request/folderRequest';
import { ImportCiphersRequest } from 'jslib/models/request/importCiphersRequest';
import { KvpRequest } from 'jslib/models/request/kvpRequest';

import { CipherView } from 'jslib/models/view/cipherView';

import { AscendoCsvImporter } from 'jslib/importers/ascendoCsvImporter';
import { AviraCsvImporter } from 'jslib/importers/aviraCsvImporter';
import { BitwardenCsvImporter } from 'jslib/importers/bitwardenCsvImporter';
import { BlurCsvImporter } from 'jslib/importers/blurCsvImporter';
import { ChromeCsvImporter } from 'jslib/importers/chromeCsvImporter';
import { ClipperzHtmlImporter } from 'jslib/importers/clipperzHtmlImporter';
import { DashlaneCsvImporter } from 'jslib/importers/dashlaneCsvImporter';
import { EnpassCsvImporter } from 'jslib/importers/enpassCsvImporter';
import { FirefoxCsvImporter } from 'jslib/importers/firefoxCsvImporter';
import { Importer } from 'jslib/importers/importer';
import { KeePass2XmlImporter } from 'jslib/importers/keepass2XmlImporter';
import { KeePassXCsvImporter } from 'jslib/importers/keepassxCsvImporter';
import { KeeperCsvImporter } from 'jslib/importers/keeperCsvImporter';
import { LastPassCsvImporter } from 'jslib/importers/lastpassCsvImporter';
import { MeldiumCsvImporter } from 'jslib/importers/meldiumCsvImporter';
import { MSecureCsvImporter } from 'jslib/importers/msecureCsvImporter';
import { OnePassword1PifImporter } from 'jslib/importers/onepassword1PifImporter';
import { OnePasswordWinCsvImporter } from 'jslib/importers/onepasswordWinCsvImporter';
import { PadlockCsvImporter } from 'jslib/importers/padlockCsvImporter';
import { PasswordDragonXmlImporter } from 'jslib/importers/passwordDragonXmlImporter';
import { PasswordSafeXmlImporter } from 'jslib/importers/passwordSafeXmlImporter';
import { RoboFormCsvImporter } from 'jslib/importers/roboformCsvImporter';
import { SafeInCloudXmlImporter } from 'jslib/importers/safeInCloudXmlImporter';
import { SaferPassCsvImporter } from 'jslib/importers/saferpassCsvImport';
import { StickyPasswordXmlImporter } from 'jslib/importers/stickyPasswordXmlImporter';
import { TrueKeyCsvImporter } from 'jslib/importers/truekeyCsvImporter';
import { UpmCsvImporter } from 'jslib/importers/upmCsvImporter';

@Component({
    selector: 'app-import',
    templateUrl: 'import.component.html',
})
export class ImportComponent implements OnInit {
    featuredImportOptions: any[];
    importOptions: any[];
    format: string = null;
    fileContents: string;
    formPromise: Promise<any>;

    protected successNavigate: any[] = ['vault'];

    constructor(protected i18nService: I18nService, protected analytics: Angulartics2,
        protected toasterService: ToasterService, protected cipherService: CipherService,
        protected folderService: FolderService, protected apiService: ApiService,
        protected router: Router) {
    }

    ngOnInit() {
        this.setImportOptions();
        this.importOptions.sort((a, b) => {
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
                this.error(this.i18nService.t('importNothingError'));
                return;
            } else if (importResult.ciphers.length > 0) {
                const halfway = Math.floor(importResult.ciphers.length / 2);
                const last = importResult.ciphers.length - 1;
                if (this.badData(importResult.ciphers[0]) && this.badData(importResult.ciphers[halfway]) &&
                    this.badData(importResult.ciphers[last])) {
                    this.error(this.i18nService.t('importFormatError'));
                    return;
                }
            }

            try {
                this.formPromise = this.postImport(importResult);
                await this.formPromise;
                this.analytics.eventTrack.next({
                    action: 'Imported Data',
                    properties: { label: this.format },
                });
                this.toasterService.popAsync('success', null, this.i18nService.t('importSuccess'));
                this.router.navigate(this.successNavigate);
            } catch { }
        } else {
            this.error(this.i18nService.t('importFormatError'));
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

    protected async postImport(importResult: ImportResult) {
        const request = new ImportCiphersRequest();
        for (let i = 0; i < importResult.ciphers.length; i++) {
            const c = await this.cipherService.encrypt(importResult.ciphers[i]);
            request.ciphers.push(new CipherRequest(c));
        }
        if (importResult.folders != null) {
            for (let i = 0; i < importResult.folders.length; i++) {
                const f = await this.folderService.encrypt(importResult.folders[i]);
                request.folders.push(new FolderRequest(f));
            }
        }
        if (importResult.folderRelationships != null) {
            importResult.folderRelationships.forEach((r) =>
                request.folderRelationships.push(new KvpRequest(r[0], r[1])));
        }
        return await this.apiService.postImportCiphers(request);
    }

    protected setImportOptions() {
        this.featuredImportOptions = [
            { id: null, name: '-- ' + this.i18nService.t('select') + ' --' },
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
            { id: '1passwordwincsv', name: '1Password 6 and 7 Windows (csv)' },
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
            { id: 'passboltcsv', name: 'Passbolt (csv)' },
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
            { id: 'blurcsv', name: 'Blur (csv)' },
        ];
    }

    protected getImporter(): Importer {
        if (this.format == null || this.format === '') {
            return null;
        }

        switch (this.format) {
            case 'bitwardencsv':
                return new BitwardenCsvImporter();
            case 'lastpasscsv':
            case 'passboltcsv':
                return new LastPassCsvImporter();
            case 'keepassxcsv':
                return new KeePassXCsvImporter();
            case 'aviracsv':
                return new AviraCsvImporter();
            case 'blurcsv':
                return new BlurCsvImporter();
            case 'safeincloudxml':
                return new SafeInCloudXmlImporter();
            case 'padlockcsv':
                return new PadlockCsvImporter();
            case 'keepass2xml':
                return new KeePass2XmlImporter();
            case 'chromecsv':
            case 'operacsv':
            case 'vivaldicsv':
                return new ChromeCsvImporter();
            case 'firefoxcsv':
                return new FirefoxCsvImporter();
            case 'upmcsv':
                return new UpmCsvImporter();
            case 'saferpasscsv':
                return new SaferPassCsvImporter();
            case 'meldiumcsv':
                return new MeldiumCsvImporter();
            case '1password1pif':
                return new OnePassword1PifImporter();
            case '1passwordwincsv':
                return new OnePasswordWinCsvImporter();
            case 'keepercsv':
                return new KeeperCsvImporter();
            case 'passworddragonxml':
                return new PasswordDragonXmlImporter();
            case 'enpasscsv':
                return new EnpassCsvImporter();
            case 'pwsafexml':
                return new PasswordSafeXmlImporter();
            case 'dashlanecsv':
                return new DashlaneCsvImporter();
            case 'msecurecsv':
                return new MSecureCsvImporter();
            case 'stickypasswordxml':
                return new StickyPasswordXmlImporter();
            case 'truekeycsv':
                return new TrueKeyCsvImporter();
            case 'clipperzhtml':
                return new ClipperzHtmlImporter();
            case 'roboformcsv':
                return new RoboFormCsvImporter();
            case 'ascendocsv':
                return new AscendoCsvImporter();
            default:
                return null;
        }
    }

    private error(errorMessage: string) {
        this.analytics.eventTrack.next({
            action: 'Import Data Failed',
            properties: { label: this.format },
        });
        this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'), errorMessage);
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

    private badData(c: CipherView) {
        return (c.name == null || c.name === '--') &&
            (c.login != null && (c.login.password == null || c.login.password === ''));
    }
}
