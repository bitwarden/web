import { Component } from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { CipherData } from 'jslib-common/models/data/cipherData';
import { Cipher } from 'jslib-common/models/domain/cipher';
import { Organization } from 'jslib-common/models/domain/organization';
import { CipherCollectionsRequest } from 'jslib-common/models/request/cipherCollectionsRequest';

import { CollectionsComponent as BaseCollectionsComponent } from '../../vault/collections.component';

@Component({
    selector: 'app-org-vault-collections',
    templateUrl: '../../vault/collections.component.html',
})
export class CollectionsComponent extends BaseCollectionsComponent {
    organization: Organization;

    constructor(collectionService: CollectionService, platformUtilsService: PlatformUtilsService,
        i18nService: I18nService, cipherService: CipherService,
        private apiService: ApiService) {
        super(collectionService, platformUtilsService, i18nService, cipherService);
        this.allowSelectNone = true;
    }

    protected async loadCipher() {
        if (!this.organization.canManageAllCollections) {
            return await super.loadCipher();
        }
        const response = await this.apiService.getCipherAdmin(this.cipherId);
        return new Cipher(new CipherData(response));
    }

    protected loadCipherCollections() {
        if (!this.organization.canManageAllCollections) {
            return super.loadCipherCollections();
        }
        return this.collectionIds;
    }

    protected loadCollections() {
        if (!this.organization.canManageAllCollections) {
            return super.loadCollections();
        }
        return Promise.resolve(this.collections);
    }

    protected saveCollections() {
        if (this.organization.canManageAllCollections) {
            const request = new CipherCollectionsRequest(this.cipherDomain.collectionIds);
            return this.apiService.putCipherCollectionsAdmin(this.cipherId, request);
        } else {
            return super.saveCollections();
        }
    }
}
