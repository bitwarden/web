import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { TwoFactorProviderType } from 'jslib-common/enums/twoFactorProviderType';
import { VerificationType } from 'jslib-common/enums/verificationType';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { UserVerificationService } from 'jslib-common/abstractions/userVerification.service';

import { Verification } from 'jslib-common/types/verification';

@Component({
    selector: 'app-two-factor-verify',
    templateUrl: 'two-factor-verify.component.html',
})
export class TwoFactorVerifyComponent {
    @Input() type: TwoFactorProviderType;
    @Input() organizationId: string;
    @Output() onAuthed = new EventEmitter<any>();

    masterPassword: Verification;
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private logService: LogService,
        private userVerificationService: UserVerificationService) { }

    async submit() {
        const request = await this.userVerificationService.buildRequest(this.masterPassword);

        try {
            switch (this.type) {
                case -1:
                    this.formPromise = this.apiService.getTwoFactorRecover(request);
                    break;
                case TwoFactorProviderType.Duo:
                case TwoFactorProviderType.OrganizationDuo:
                    if (this.organizationId != null) {
                        this.formPromise = this.apiService.getTwoFactorOrganizationDuo(this.organizationId, request);
                    } else {
                        this.formPromise = this.apiService.getTwoFactorDuo(request);
                    }
                    break;
                case TwoFactorProviderType.Email:
                    this.formPromise = this.apiService.getTwoFactorEmail(request);
                    break;
                case TwoFactorProviderType.WebAuthn:
                    this.formPromise = this.apiService.getTwoFactorWebAuthn(request);
                    break;
                case TwoFactorProviderType.Authenticator:
                    this.formPromise = this.apiService.getTwoFactorAuthenticator(request);
                    break;
                case TwoFactorProviderType.Yubikey:
                    this.formPromise = this.apiService.getTwoFactorYubiKey(request);
                    break;
            }

            const response = await this.formPromise;
            this.onAuthed.emit({
                response: response,
                secret: this.masterPassword.type === VerificationType.MasterPassword
                    ? request.masterPasswordHash
                    : request.otp,
                verificationType: this.masterPassword.type,
            });
        } catch (e) {
            this.logService.error(e);
        }
    }
}
