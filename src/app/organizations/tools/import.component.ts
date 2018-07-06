import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { Importer } from 'jslib/importers/importer';

import { CipherRequest } from 'jslib/models/request/cipherRequest';
import { CollectionRequest } from 'jslib/models/request/collectionRequest';
import { ImportOrganizationCiphersRequest } from 'jslib/models/request/importOrganizationCiphersRequest';
import { KvpRequest } from 'jslib/models/request/kvpRequest';

import { ImportResult } from 'jslib/models/domain/importResult';

import { ImportComponent as BaseImportComponent } from '../../tools/import.component';

@Component({
    selector: 'app-org-import',
    templateUrl: '../../tools/import.component.html',
})
export class ImportComponent extends BaseImportComponent {
    organizationId: string;

    constructor(i18nService: I18nService, analytics: Angulartics2,
        toasterService: ToasterService, cipherService: CipherService,
        folderService: FolderService, apiService: ApiService,
        router: Router, private collectionService: CollectionService,
        private route: ActivatedRoute) {
        super(i18nService, analytics, toasterService, cipherService, folderService, apiService, router);
    }

    ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            this.successNavigate = ['organizations', this.organizationId, 'vault'];
            super.ngOnInit();
        });
    }

    protected async postImport(importResult: ImportResult) {
        const request = new ImportOrganizationCiphersRequest();
        for (let i = 0; i < importResult.ciphers.length; i++) {
            importResult.ciphers[i].organizationId = this.organizationId;
            const c = await this.cipherService.encrypt(importResult.ciphers[i]);
            request.ciphers.push(new CipherRequest(c));
        }
        if (importResult.collections != null) {
            for (let i = 0; i < importResult.collections.length; i++) {
                importResult.collections[i].organizationId = this.organizationId;
                const c = await this.collectionService.encrypt(importResult.collections[i]);
                request.collections.push(new CollectionRequest(c));
            }
        }
        if (importResult.collectionRelationships != null) {
            importResult.collectionRelationships.forEach((v: number, k: number) =>
                request.collectionRelationships.push(new KvpRequest(k, v)));
        }
        return await this.apiService.postImportOrganizationCiphers(this.organizationId, request);
    }

    protected setImportOptions() {
        this.featuredImportOptions = [
            { id: null, name: '-- ' + this.i18nService.t('select') + ' --' },
            { id: 'bitwardencsv', name: 'Bitwarden (csv)' },
            { id: 'lastpasscsv', name: 'LastPass (csv)' },
        ];
        this.importOptions = [];
    }

    protected getImporter(): Importer {
        const importer = super.getImporter();
        if (importer != null) {
            importer.organization = true;
        }
        return importer;
    }
}
