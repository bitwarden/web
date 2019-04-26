import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SearchService } from 'jslib/abstractions/search.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';
import { LoginView } from 'jslib/models/view/loginView';

const MaxCheckedCount = 500;

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent implements OnDestroy {
    @Input() showAddNew = true;
    @Output() onAttachmentsClicked = new EventEmitter<CipherView>();
    @Output() onShareClicked = new EventEmitter<CipherView>();
    @Output() onCollectionsClicked = new EventEmitter<CipherView>();

    cipherType = CipherType;
    actionPromise: Promise<any>;

    constructor(searchService: SearchService, protected analytics: Angulartics2,
        protected toasterService: ToasterService, protected i18nService: I18nService,
        protected platformUtilsService: PlatformUtilsService, protected cipherService: CipherService) {
        super(searchService);
        this.pageSize = 200;
    }

    ngOnDestroy() {
        this.selectAll(false);
    }

    checkCipher(c: CipherView, select?: boolean) {
        (c as any).checked = select == null ? !(c as any).checked : select;
    }

    launch(view: LoginView) {
        if (!view.canLaunch) {
            return;
        }

        this.platformUtilsService.eventTrack('Launched Login URI');
        this.platformUtilsService.launchUri(view.launchUri);
    }

    selectAll(select: boolean) {
        if (select) {
            this.selectAll(false);
        }
        const selectCount = select && this.ciphers.length > MaxCheckedCount ? MaxCheckedCount : this.ciphers.length;
        for (let i = 0; i < selectCount; i++) {
            this.checkCipher(this.ciphers[i], select);
        }
    }

    getSelected(): CipherView[] {
        if (this.ciphers == null) {
            return [];
        }
        return this.ciphers.filter((c) => !!(c as any).checked);
    }

    getSelectedIds(): string[] {
        return this.getSelected().map((c) => c.id);
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
        if (this.actionPromise != null) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('deleteItemConfirmation'), this.i18nService.t('deleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.deleteCipher(c.id);
            await this.actionPromise;
            this.analytics.eventTrack.next({ action: 'Deleted Cipher' });
            this.toasterService.popAsync('success', null, this.i18nService.t('deletedItem'));
            this.refresh();
        } catch { }
        this.actionPromise = null;
    }

    copy(value: string, typeI18nKey: string, aType: string) {
        if (value == null) {
            return;
        }

        this.analytics.eventTrack.next({ action: 'Copied ' + aType.toLowerCase() + ' from listing.' });
        this.platformUtilsService.copyToClipboard(value, { window: window });
        this.toasterService.popAsync('info', null,
            this.i18nService.t('valueCopied', this.i18nService.t(typeI18nKey)));
    }

    protected deleteCipher(id: string) {
        return this.cipherService.deleteWithServer(id);
    }

    protected showFixOldAttachments(c: CipherView) {
        return c.hasOldAttachments && c.organizationId == null;
    }
}
