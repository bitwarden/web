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
    selector: 'app-reused-passwords-report',
    templateUrl: 'reused-passwords-report.component.html',
})
export class ReusedPasswordsReportComponent implements OnInit {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    loading = true;
    hasLoaded = false;
    ciphers: CipherView[] = [];
    passwordUseMap: Map<string, number>;

    private modal: ModalComponent = null;

    constructor(private ciphersService: CipherService, private componentFactoryResolver: ComponentFactoryResolver) { }

    async ngOnInit() {
        await this.load();
        this.hasLoaded = true;
    }

    async load() {
        this.loading = true;
        const allCiphers = await this.ciphersService.getAllDecrypted();
        const ciphersWithPasswords: CipherView[] = [];
        this.passwordUseMap = new Map<string, number>();
        allCiphers.forEach((c) => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '') {
                return;
            }
            ciphersWithPasswords.push(c);
            if (this.passwordUseMap.has(c.login.password)) {
                this.passwordUseMap.set(c.login.password, this.passwordUseMap.get(c.login.password) + 1);
            } else {
                this.passwordUseMap.set(c.login.password, 1);
            }
        });
        const reusedPasswordCiphers = ciphersWithPasswords.filter((c) =>
            this.passwordUseMap.has(c.login.password) && this.passwordUseMap.get(c.login.password) > 1);
        this.ciphers = reusedPasswordCiphers;
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
