import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { ModalComponent } from '../modal.component';
import { AddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-unsecured-websites-report',
    templateUrl: 'unsecured-websites-report.component.html',
})
export class UnsecuredWebsitesReportComponent implements OnInit {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    loading = true;
    hasLoaded = false;
    ciphers: CipherView[] = [];

    private modal: ModalComponent = null;

    constructor(private ciphersService: CipherService, private componentFactoryResolver: ComponentFactoryResolver) { }

    async ngOnInit() {
        this.load();
        this.hasLoaded = true;
    }

    async load() {
        this.loading = true;
        const allCiphers = await this.ciphersService.getAllDecrypted();
        this.ciphers = allCiphers.filter((c) => {
            if (c.type !== CipherType.Login || !c.login.hasUris) {
                return false;
            }
            return c.login.uris.find((u) => u.uri.indexOf('http://') === 0) != null;
        });
        this.loading = false;
    }

    selectCipher(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.cipherAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(
            AddEditComponent, this.cipherAddEditModalRef);

        childComponent.cipherId = cipher == null ? null : cipher.id;
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }
}
