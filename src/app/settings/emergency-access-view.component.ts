import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';

import { CipherData } from 'jslib/models/data';
import { Cipher, SymmetricCryptoKey } from 'jslib/models/domain';
import { EmergencyAccessViewResponse } from 'jslib/models/response/emergencyAccessResponse';
import { CipherView } from 'jslib/models/view/cipherView';

import { ModalComponent } from '../modal.component';

import { EmergencyAccessAttachmentsComponent } from './emergency-access-attachments.component';
import { EmergencyAddEditComponent } from './emergency-add-edit.component';

@Component({
    selector: 'emergency-access-view',
    templateUrl: 'emergency-access-view.component.html',
})
export class EmergencyAccessViewComponent implements OnInit {
    @ViewChild('cipherAddEdit', { read: ViewContainerRef, static: true }) cipherAddEditModalRef: ViewContainerRef;
    @ViewChild('attachments', { read: ViewContainerRef, static: true }) attachmentsModalRef: ViewContainerRef;

    id: string;
    ciphers: CipherView[] = [];

    private modal: ModalComponent = null;

    constructor(private cipherService: CipherService, private cryptoService: CryptoService,
        private componentFactoryResolver: ComponentFactoryResolver, private router: Router,
        private route: ActivatedRoute, private apiService: ApiService) { }

    ngOnInit() {
        this.route.params.subscribe(qParams => {
            if (qParams.id == null) {
                return this.router.navigate(['settings/emergency-access']);
            }

            this.id = qParams.id;

            this.load();
        });
    }

    selectCipher(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.cipherAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EmergencyAddEditComponent>(EmergencyAddEditComponent, this.cipherAddEditModalRef);

        childComponent.cipherId = cipher == null ? null : cipher.id;
        childComponent.cipher = cipher;

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    async load() {
        const response = await this.apiService.postEmergencyAccessView(this.id);
        this.ciphers = await this.getAllCiphers(response);
    }

    async viewAttachments(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.attachmentsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EmergencyAccessAttachmentsComponent>(EmergencyAccessAttachmentsComponent, this.attachmentsModalRef);

        childComponent.cipher = cipher;
        childComponent.emergencyAccessId = this.id;

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    protected async getAllCiphers(response: EmergencyAccessViewResponse): Promise<CipherView[]> {
        const ciphers = response.ciphers;

        const decCiphers: CipherView[] = [];
        const oldKeyBuffer = await this.cryptoService.rsaDecrypt(response.keyEncrypted);
        const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer);

        const promises: any[] = [];
        ciphers.forEach(cipherResponse => {
            const cipherData = new CipherData(cipherResponse);
            const cipher = new Cipher(cipherData);
            promises.push(cipher.decrypt(oldEncKey).then(c => decCiphers.push(c)));
        });

        await Promise.all(promises);
        decCiphers.sort(this.cipherService.getLocaleSortingFunction());

        return decCiphers;
    }
}
