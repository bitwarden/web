import {
    Component,
    ComponentFactoryResolver,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, CryptoService } from 'jslib/abstractions';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { UserService } from 'jslib/abstractions/user.service';
import { CipherData } from 'jslib/models/data';
import { Cipher, SymmetricCryptoKey } from 'jslib/models/domain';
import { EmergencyAccessViewResponse } from 'jslib/models/response/emergencyAccessResponse';

import { CipherView } from 'jslib/models/view/cipherView';
import { ModalComponent } from '../modal.component';

import { CipherReportComponent } from '../tools/cipher-report.component';
import { EmergencyAddEditComponent } from './emergency-add-edit.component';

@Component({
    selector: 'emergency-access-view',
    templateUrl: 'emergency-access-view.component.html',
})
export class EmergencyAccessViewComponent extends CipherReportComponent implements OnInit {
    exposedPasswordMap = new Map<string, number>();
    id: string;
    response: EmergencyAccessViewResponse;

    constructor(protected cipherService: CipherService, private cryptoService: CryptoService, componentFactoryResolver: ComponentFactoryResolver,
        messagingService: MessagingService, userService: UserService, private router: Router, private route: ActivatedRoute, private apiService: ApiService) {
        super(componentFactoryResolver, userService, messagingService, true);
    }

    ngOnInit() {
        this.route.params.subscribe((qParams) => {
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
        if (this.organization != null) {
            childComponent.organizationId = this.organization.id;
        }
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onRestoredCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }

    async load() {
        this.response = await this.apiService.postEmergencyAccessView(this.id);
        super.load();
    }

    async setCiphers() {
        const allCiphers = await this.getAllCiphers();

        this.ciphers = allCiphers;
    }

    protected async getAllCiphers(): Promise<CipherView[]> {
        const ciphers = this.response.ciphers;

        const decCiphers: CipherView[] = [];
        const oldKeyBuffer = await this.cryptoService.rsaDecrypt(this.response.keyEncrypted);
        const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer);

        const promises: any[] = [];
        ciphers.forEach((cipherResponse) => {
            const cipherData = new CipherData(cipherResponse);
            const cipher = new Cipher(cipherData);
            promises.push(cipher.decrypt(oldEncKey).then((c) => decCiphers.push(c)));
        });

        await Promise.all(promises);
        decCiphers.sort(this.cipherService.getLocaleSortingFunction());

        return decCiphers;
    }
}
