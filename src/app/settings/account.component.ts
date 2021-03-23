import {
    Component,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ModalComponent } from '../modal.component';
import { ApiKeyComponent } from './api-key.component';
import { DeauthorizeSessionsComponent } from './deauthorize-sessions.component';
import { DeleteAccountComponent } from './delete-account.component';
import { PurgeVaultComponent } from './purge-vault.component';

import { ApiService } from 'jslib/abstractions/api.service';
import { UserService } from 'jslib/abstractions/user.service';

@Component({
    selector: 'app-account',
    templateUrl: 'account.component.html',
})
export class AccountComponent {
    @ViewChild('deauthorizeSessionsTemplate', { read: ViewContainerRef, static: true }) deauthModalRef: ViewContainerRef;
    @ViewChild('purgeVaultTemplate', { read: ViewContainerRef, static: true }) purgeModalRef: ViewContainerRef;
    @ViewChild('deleteAccountTemplate', { read: ViewContainerRef, static: true }) deleteModalRef: ViewContainerRef;
    @ViewChild('viewUserApiKeyTemplate', { read: ViewContainerRef, static: true }) viewUserApiKeyModalRef: ViewContainerRef;
    @ViewChild('rotateUserApiKeyTemplate', { read: ViewContainerRef, static: true }) rotateUserApiKeyModalRef: ViewContainerRef;

    private modal: ModalComponent = null;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private apiService: ApiService,
        private userService: UserService) { }

    deauthorizeSessions() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deauthModalRef.createComponent(factory).instance;
        this.modal.show<DeauthorizeSessionsComponent>(DeauthorizeSessionsComponent, this.deauthModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    purgeVault() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.purgeModalRef.createComponent(factory).instance;
        this.modal.show<PurgeVaultComponent>(PurgeVaultComponent, this.purgeModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    deleteAccount() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.deleteModalRef.createComponent(factory).instance;
        this.modal.show<DeleteAccountComponent>(DeleteAccountComponent, this.deleteModalRef);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    async viewUserApiKey() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.viewUserApiKeyModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ApiKeyComponent>(ApiKeyComponent, this.viewUserApiKeyModalRef);
        childComponent.keyType = 'user';
        childComponent.entityId = await this.userService.getUserId();
        childComponent.postKey = this.apiService.postUserApiKey.bind(this.apiService);
        childComponent.scope = 'api';
        childComponent.grantType = 'client_credentials';
        childComponent.apiKeyTitle = 'apiKey';
        childComponent.apiKeyWarning = 'userApiKeyWarning';
        childComponent.apiKeyDescription = 'userApiKeyDesc';

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    async rotateUserApiKey() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.rotateUserApiKeyModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ApiKeyComponent>(ApiKeyComponent, this.rotateUserApiKeyModalRef);
        childComponent.keyType = 'user';
        childComponent.isRotation = true;
        childComponent.entityId = await this.userService.getUserId();
        childComponent.postKey = this.apiService.postUserRotateApiKey.bind(this.apiService);
        childComponent.scope = 'api';
        childComponent.grantType = 'client_credentials';
        childComponent.apiKeyTitle = 'apiKey';
        childComponent.apiKeyWarning = 'userApiKeyWarning';
        childComponent.apiKeyDescription = 'apiKeyRotateDesc';

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }
}
