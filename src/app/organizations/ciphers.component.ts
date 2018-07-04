import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';
import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-org-vault-ciphers',
    templateUrl: '../vault/ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    @Input() showAddNew = true;
    @Output() onAttachmentsClicked = new EventEmitter<CipherView>();
    @Output() onCollectionsClicked = new EventEmitter<CipherView>();

    organization: Organization;
    cipherType = CipherType;

    constructor(cipherService: CipherService, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService, private apiService: ApiService) {
        super(cipherService);
    }

    async load(filter: (cipher: CipherView) => boolean = null) {
        if (this.organization.isAdmin) {
            const ciphers = await this.apiService.getCiphersOrganization(this.organization.id);
            if (ciphers != null && ciphers.data != null && ciphers.data.length) {
                const decCiphers: CipherView[] = [];
                const promises: any[] = [];
                ciphers.data.forEach((r) => {
                    const data = new CipherData(r);
                    const cipher = new Cipher(data);
                    promises.push(cipher.decrypt().then((c) => decCiphers.push(c)));
                });
                await Promise.all(promises);
                decCiphers.sort(this.cipherService.getLocaleSortingFunction());
                this.allCiphers = decCiphers;
            } else {
                this.allCiphers = [];
            }
            this.applyFilter(filter);
            this.loaded = true;
        } else {
            await super.load();
        }
    }

    applyFilter(filter: (cipher: CipherView) => boolean = null) {
        if (this.organization.isAdmin) {
            super.applyFilter(filter);
        } else {
            const f = (c: CipherView) => c.organizationId === this.organization.id && (filter == null || filter(c));
            super.applyFilter(f);
        }
    }

    checkCipher(c: CipherView) {
        // do nothing
    }

    attachments(c: CipherView) {
        this.onAttachmentsClicked.emit(c);
    }

    collections(c: CipherView) {
        this.onCollectionsClicked.emit(c);
    }

    async delete(c: CipherView): Promise<boolean> {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteItemConfirmation'), this.i18nService.t('deleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        await this.cipherService.deleteWithServer(c.id);
        this.analytics.eventTrack.next({ action: 'Deleted Cipher' });
        this.toasterService.popAsync('success', null, this.i18nService.t('deletedItem'));
        this.refresh();
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Copied ' + aType.toLowerCase() + ' from listing.' });
        this.platformUtilsService.copyToClipboard(value, { doc: window.document });
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));
    }
}
