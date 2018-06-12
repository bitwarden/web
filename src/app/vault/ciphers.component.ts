import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    @Output() onAttachmentsClicked = new EventEmitter<CipherView>();
    @Output() onShareClicked = new EventEmitter<CipherView>();
    @Output() onCollectionsClicked = new EventEmitter<CipherView>();
    cipherType = CipherType;

    constructor(cipherService: CipherService, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService) {
        super(cipherService);
    }

    checkCipher(c: CipherView) {
        (c as any).checked = !(c as any).checked;
    }

    attachments(c: CipherView) {
        this.onAttachmentsClicked.emit(c);
    }

    share(c: CipherView) {
        this.onShareClicked.emit(c);
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
