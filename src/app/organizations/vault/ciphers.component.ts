import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CipherData } from 'jslib/models/data/cipherData';
import { Cipher } from 'jslib/models/domain/cipher';
import { Organization } from 'jslib/models/domain/organization';
import { CipherView } from 'jslib/models/view/cipherView';

import { CiphersComponent as BaseCiphersComponent } from '../../vault/ciphers.component';

@Component({
    selector: 'app-org-vault-ciphers',
    templateUrl: '../../vault/ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    @Output() onEventsClicked = new EventEmitter<CipherView>();

    organization: Organization;
    accessEvents = false;

    constructor(cipherService: CipherService, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, private apiService: ApiService) {
        super(cipherService, analytics, toasterService, i18nService, platformUtilsService);
    }

    async load(filter: (cipher: CipherView) => boolean = null) {
        if (!this.organization.isAdmin) {
            await super.load();
            return;
        }
        this.accessEvents = this.organization.useEvents;
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

    events(c: CipherView) {
        this.onEventsClicked.emit(c);
    }

    protected deleteCipher(id: string) {
        if (!this.organization.isAdmin) {
            return super.deleteCipher(id);
        }
        return this.apiService.deleteCipherAdmin(id);
    }
}
