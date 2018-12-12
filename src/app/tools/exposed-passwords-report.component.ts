import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { ModalComponent } from '../modal.component';
import { AddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-exposed-passwords-report',
    templateUrl: 'exposed-passwords-report.component.html',
})
export class ExposedPasswordsReportComponent {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    loading = false;
    hasLoaded = false;
    ciphers: CipherView[] = [];
    exposedPasswordMap = new Map<string, number>();

    private modal: ModalComponent = null;

    constructor(private ciphersService: CipherService, private auditService: AuditService,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    async load() {
        this.loading = true;
        const allCiphers = await this.ciphersService.getAllDecrypted();
        const exposedPasswordCiphers: CipherView[] = [];
        const promises: Array<Promise<void>> = [];
        allCiphers.forEach((c) => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '') {
                return;
            }
            const promise = this.auditService.passwordLeaked(c.login.password).then((exposedCount) => {
                if (exposedCount > 0) {
                    exposedPasswordCiphers.push(c);
                    this.exposedPasswordMap.set(c.id, exposedCount);
                }
            });
            promises.push(promise);
        });
        await Promise.all(promises);
        this.ciphers = exposedPasswordCiphers;
        this.loading = false;
        this.hasLoaded = true;
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
