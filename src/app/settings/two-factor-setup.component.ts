import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { TwoFactorProviders } from 'jslib/services/auth.service';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { ModalComponent } from '../modal.component';

import { TwoFactorAuthenticatorComponent } from './two-factor-authenticator.component';
import { TwoFactorDuoComponent } from './two-factor-duo.component';
import { TwoFactorEmailComponent } from './two-factor-email.component';
import { TwoFactorRecoveryComponent } from './two-factor-recovery.component';
import { TwoFactorU2fComponent } from './two-factor-u2f.component';
import { TwoFactorYubiKeyComponent } from './two-factor-yubikey.component';

@Component({
    selector: 'app-two-factor-setup',
    templateUrl: 'two-factor-setup.component.html',
})
export class TwoFactorSetupComponent implements OnInit {
    @ViewChild('recoveryTemplate', { read: ViewContainerRef }) recoveryModalRef: ViewContainerRef;
    @ViewChild('authenticatorTemplate', { read: ViewContainerRef }) authenticatorModalRef: ViewContainerRef;
    @ViewChild('yubikeyTemplate', { read: ViewContainerRef }) yubikeyModalRef: ViewContainerRef;
    @ViewChild('u2fTemplate', { read: ViewContainerRef }) u2fModalRef: ViewContainerRef;
    @ViewChild('duoTemplate', { read: ViewContainerRef }) duoModalRef: ViewContainerRef;
    @ViewChild('emailTemplate', { read: ViewContainerRef }) emailModalRef: ViewContainerRef;

    providers: any[] = [];
    premium: boolean;
    loading = true;

    private modal: ModalComponent = null;

    constructor(private apiService: ApiService, private tokenService: TokenService,
        private componentFactoryResolver: ComponentFactoryResolver) { }

    async ngOnInit() {
        this.premium = this.tokenService.getPremium();

        for (const key in TwoFactorProviders) {
            if (!TwoFactorProviders.hasOwnProperty(key)) {
                continue;
            }

            const p = (TwoFactorProviders as any)[key];
            if (p.type === TwoFactorProviderType.OrganizationDuo) {
                continue;
            }

            this.providers.push({
                type: p.type,
                name: p.name,
                description: p.description,
                enabled: false,
                premium: p.premium,
                sort: p.sort,
            });
        }

        this.providers.sort((a: any, b: any) => a.sort - b.sort);
        await this.load();
    }

    async load() {
        this.loading = true;
        const providerList = await this.apiService.getTwoFactorProviders();
        providerList.data.forEach((p) => {
            this.providers.forEach((p2) => {
                if (p.type === p2.type) {
                    p2.enabled = p.enabled;
                }
            });
        });
        this.loading = false;
    }

    manage(type: TwoFactorProviderType) {
        switch (type) {
            case TwoFactorProviderType.Authenticator:
                const authComp = this.openModal(this.authenticatorModalRef, TwoFactorAuthenticatorComponent);
                authComp.onUpdated.subscribe((enabled: boolean) => {
                    this.updateStatus(enabled, TwoFactorProviderType.Authenticator);
                });
                break;
            case TwoFactorProviderType.Yubikey:
                const yubiComp = this.openModal(this.yubikeyModalRef, TwoFactorYubiKeyComponent);
                yubiComp.onUpdated.subscribe((enabled: boolean) => {
                    this.updateStatus(enabled, TwoFactorProviderType.Yubikey);
                });
                break;
            case TwoFactorProviderType.Duo:
                const duoComp = this.openModal(this.duoModalRef, TwoFactorDuoComponent);
                duoComp.onUpdated.subscribe((enabled: boolean) => {
                    this.updateStatus(enabled, TwoFactorProviderType.Duo);
                });
                break;
            case TwoFactorProviderType.Email:
                const emailComp = this.openModal(this.emailModalRef, TwoFactorEmailComponent);
                emailComp.onUpdated.subscribe((enabled: boolean) => {
                    this.updateStatus(enabled, TwoFactorProviderType.Email);
                });
                break;
            case TwoFactorProviderType.U2f:
                const u2fComp = this.openModal(this.u2fModalRef, TwoFactorU2fComponent);
                u2fComp.onUpdated.subscribe((enabled: boolean) => {
                    this.updateStatus(enabled, TwoFactorProviderType.U2f);
                });
                break;
            default:
                break;
        }
    }

    recoveryCode() {
        this.openModal(this.recoveryModalRef, TwoFactorRecoveryComponent);
    }

    private openModal<T>(ref: ViewContainerRef, type: Type<T>): T {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = ref.createComponent(factory).instance;
        const childComponent = this.modal.show<T>(type, ref);

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
        return childComponent;
    }

    private updateStatus(enabled: boolean, type: TwoFactorProviderType) {
        if (!enabled && this.modal != null) {
            this.modal.close();
        }
        this.providers.forEach((p) => {
            if (p.type === type) {
                p.enabled = enabled;
            }
        });
    }
}
