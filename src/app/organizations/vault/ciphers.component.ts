import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';

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

    protected allCiphers: CipherView[] = [];

    constructor(searchService: SearchService, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, cipherService: CipherService,
        private apiService: ApiService, eventService: EventService, totpService: TotpService, userService: UserService) {
        super(searchService, analytics, toasterService, i18nService, platformUtilsService,
            cipherService, eventService, totpService, userService);
    }

    async load(filter: (cipher: CipherView) => boolean = null) {
        if (!this.organization.canManageAllCollections) {
            await super.load(filter, this.deleted);
            return;
        }
        this.accessEvents = this.organization.useEvents;
        this.allCiphers = await this.cipherService.getAllFromApiForOrganization(this.organization.id);
        await this.searchService.indexCiphers(this.allCiphers);
        await this.applyFilter(filter);
        this.loaded = true;
    }

    async applyFilter(filter: (cipher: CipherView) => boolean = null) {
        if (this.organization.canManageAllCollections) {
            await super.applyFilter(filter);
        } else {
            const f = (c: CipherView) => c.organizationId === this.organization.id && (filter == null || filter(c));
            await super.applyFilter(f);
        }
    }

    async search(timeout: number = null) {
        super.search(timeout, this.allCiphers);
    }
    events(c: CipherView) {
        this.onEventsClicked.emit(c);
    }

    protected deleteCipher(id: string) {
        if (!this.organization.canManageAllCollections) {
            return super.deleteCipher(id, this.deleted);
        }
        return this.deleted ? this.apiService.deleteCipherAdmin(id) : this.apiService.putDeleteCipherAdmin(id);
    }

    protected showFixOldAttachments(c: CipherView) {
        return this.organization.canManageAllCollections && c.hasOldAttachments;
    }
}
