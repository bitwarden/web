import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { ApiService } from 'jslib/abstractions/api.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { UserService } from 'jslib/abstractions/user.service';

import { TwoFactorProviders } from 'jslib/services/auth.service';

import { PolicyType } from 'jslib/enums/policyType';
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
    @ViewChild('recoveryTemplate', { read: ViewContainerRef, static: true })
    recoveryModalRef: ViewContainerRef;
    @ViewChild('authenticatorTemplate', {
        read: ViewContainerRef,
        static: true,
    })
    authenticatorModalRef: ViewContainerRef;
    @ViewChild('yubikeyTemplate', { read: ViewContainerRef, static: true })
    yubikeyModalRef: ViewContainerRef;
    @ViewChild('u2fTemplate', { read: ViewContainerRef, static: true })
    u2fModalRef: ViewContainerRef;
    @ViewChild('duoTemplate', { read: ViewContainerRef, static: true })
    duoModalRef: ViewContainerRef;
    @ViewChild('emailTemplate', { read: ViewContainerRef, static: true })
    emailModalRef: ViewContainerRef;

    organizationId: string;
    providers: any[] = [];
    canAccessPremium: boolean;
    showPolicyWarning = false;
    loading = true;

    private modal: ModalComponent = null;

    constructor(
        protected apiService: ApiService,
        protected userService: UserService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected messagingService: MessagingService,
        protected policyService: PolicyService
    ) {}

    async ngOnInit() {
        this.canAccessPremium = await this.userService.canAccessPremium();

        for (const key in TwoFactorProviders) {
            // eslint-disable-next-line no-prototype-builtins
            if (!TwoFactorProviders.hasOwnProperty(key)) {
                continue;
            }

            const p = (TwoFactorProviders as any)[key];
            if (this.filterProvider(p.type)) {
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
        const providerList = await this.getTwoFactorProviders();
        providerList.data.forEach((p) => {
            this.providers.forEach((p2) => {
                if (p.type === p2.type) {
                    p2.enabled = p.enabled;
                }
            });
        });
        this.evaluatePolicies();
        this.loading = false;
    }

    manage(type: TwoFactorProviderType) {
        switch (type) {
            case TwoFactorProviderType.Authenticator:
                const authComp = this.openModal(
                    this.authenticatorModalRef,
                    TwoFactorAuthenticatorComponent
                );
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

    async premiumRequired() {
        if (!this.canAccessPremium) {
            this.messagingService.send('premiumRequired');
            return;
        }
    }

    protected getTwoFactorProviders() {
        return this.apiService.getTwoFactorProviders();
    }

    protected filterProvider(type: TwoFactorProviderType) {
        return type === TwoFactorProviderType.OrganizationDuo;
    }

    protected openModal<T>(ref: ViewContainerRef, type: Type<T>): T {
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

    protected updateStatus(enabled: boolean, type: TwoFactorProviderType) {
        if (!enabled && this.modal != null) {
            this.modal.close();
        }
        this.providers.forEach((p) => {
            if (p.type === type) {
                p.enabled = enabled;
            }
        });
        this.evaluatePolicies();
    }

    private async evaluatePolicies() {
        if (this.organizationId == null && this.providers.filter((p) => p.enabled).length === 1) {
            const policies = await this.policyService.getAll(PolicyType.TwoFactorAuthentication);
            this.showPolicyWarning = policies != null && policies.some((p) => p.enabled);
        } else {
            this.showPolicyWarning = false;
        }
    }
}
