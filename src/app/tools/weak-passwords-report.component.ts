import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { ModalComponent } from '../modal.component';
import { AddEditComponent } from '../vault/add-edit.component';

@Component({
    selector: 'app-weak-passwords-report',
    templateUrl: 'weak-passwords-report.component.html',
})
export class WeakPasswordsReportComponent implements OnInit {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    loading = true;
    hasLoaded = false;
    ciphers: CipherView[] = [];
    passwordStrengthMap = new Map<string, [string, string]>();

    private modal: ModalComponent = null;

    constructor(private ciphersService: CipherService, private passwordGenerationService: PasswordGenerationService,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    async ngOnInit() {
        await this.load();
    }

    async load() {
        this.loading = true;
        const allCiphers = await this.ciphersService.getAllDecrypted();
        const weakPasswordCiphers: CipherView[] = [];
        allCiphers.forEach((c) => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '') {
                return;
            }
            const result = this.passwordGenerationService.passwordStrength(c.login.password);
            if (result.score <= 3) {
                this.passwordStrengthMap.set(c.id, this.scoreKey(result.score));
                weakPasswordCiphers.push(c);
            }
        });
        this.ciphers = weakPasswordCiphers;
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

    private scoreKey(score: number): [string, string] {
        switch (score) {
            case 4:
                return ['strong', 'success'];
            case 3:
                return ['good', 'primary'];
            case 2:
                return ['weak', 'warning'];
            default:
                return ['veryWeak', 'danger'];
        }
    }
}
