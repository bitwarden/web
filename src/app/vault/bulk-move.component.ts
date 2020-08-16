import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { FolderView } from 'jslib/models/view/folderView';

@Component({
    selector: 'app-vault-bulk-move',
    templateUrl: 'bulk-move.component.html',
})
export class BulkMoveComponent implements OnInit {
    @Input() cipherIds: string[] = [];
    @Output() onMoved = new EventEmitter();

    folderId: string = null;
    folders: FolderView[] = [];
    formPromise: Promise<any>;

    constructor(
        private analytics: Angulartics2,
        private cipherService: CipherService,
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private folderService: FolderService
    ) {}

    async ngOnInit() {
        this.folders = await this.folderService.getAllDecrypted();
        this.folderId = this.folders[0].id;
    }

    async submit() {
        this.formPromise = this.cipherService.moveManyWithServer(this.cipherIds, this.folderId);
        await this.formPromise;
        this.onMoved.emit();
        this.analytics.eventTrack.next({ action: 'Bulk Moved Items' });
        this.toasterService.popAsync('success', null, this.i18nService.t('movedItems'));
    }
}
