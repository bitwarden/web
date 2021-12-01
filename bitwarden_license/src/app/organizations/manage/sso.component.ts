import {
    Component,
    OnInit,
} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { SsoConfigApi } from 'jslib-common/models/api/ssoConfigApi';

import { Organization } from 'jslib-common/models/domain/organization';

import { OrganizationSsoRequest } from 'jslib-common/models/request/organization/organizationSsoRequest';
import {
    OrganizationSsoResponse,
    SsoUrls
} from 'jslib-common/models/response/organization/organizationSsoResponse';

import {
    Saml2BindingType,
    Saml2SigningBehavior,
    SsoType,
} from 'jslib-common/enums/ssoEnums';

import { requiredIf } from '../../../../../src/app/validators/requiredIf.validator';

@Component({
    selector: 'app-org-manage-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent implements OnInit {

    get enableTestKeyConnector() {
        return this.commonData.get('keyConnectorEnabled').value &&
            this.keyConnectorUrl != null &&
            this.keyConnectorUrl.value !== '';
    }

    get keyConnectorUrl() {
        return this.commonData.get('keyConnectorUrl');
    }

    readonly ssoTypeOptions = [
        { name: 'OpenID Connect', value: SsoType.OpenIdConnect },
        { name: 'SAML 2.0', value: SsoType.Saml2 },
    ];

    readonly ssoType = SsoType;

    loading = true;
    organizationId: string;
    organization: Organization;
    formPromise: Promise<any>;

    ssoUrls: SsoUrls;

    enabled = this.fb.control(false);

    openIdForm = this.fb.group({
        authority: ['', Validators.required],
        clientId: ['', Validators.required],
        clientSecret: ['', Validators.required],
        metadataAddress: [],
        redirectBehavior: [],
        getClaimsFromUserInfoEndpoint: [],
        additionalScopes: [],
        additionalUserIdClaimTypes: [],
        additionalEmailClaimTypes: [],
        additionalNameClaimTypes: [],
        acrValues: [],
        expectedReturnAcrValue: [],
    });

    samlForm = this.fb.group({
        spNameIdFormat: [],
        spOutboundSigningAlgorithm: [],
        spSigningBehavior: [],
        spMinIncomingSigningAlgorithm: [],
        spWantAssertionsSigned: [],
        spValidateCertificates: [],

        idpEntityId: ['', Validators.required],
        idpBindingType: [],
        idpSingleSignOnServiceUrl: [],
        idpSingleLogoutServiceUrl: [],
        idpArtifactResolutionServiceUrl: ['',
            requiredIf(control => control.parent?.get('idpBindingType').value === Saml2BindingType.Artifact)],
        idpX509PublicCert: ['',
            requiredIf(control => control.parent?.get('spSigningBehavior').value !== Saml2SigningBehavior.Never)],
        idpOutboundSigningAlgorithm: [],
        idpAllowUnsolicitedAuthnResponse: [],
        idpAllowOutboundLogoutRequests: [true], // TODO: update in model, handle transition
        idpWantAuthnRequestsSigned: [],
    });

    commonData = this.fb.group({
        configType: [0, {
            updateOn: 'change',
        }],

        keyConnectorEnabled: [],
        keyConnectorUrl: [],
    });

    ssoConfigForm = this.fb.group({
        openId: this.openIdForm,
        saml: this.samlForm,
        common: this.commonData,
    }, {
        updateOn: 'submit',
    });

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private userService: UserService) { }

    async ngOnInit() {
        this.commonData.get('configType').valueChanges.subscribe((newType: SsoType) => {
            if (newType === SsoType.OpenIdConnect) {
                this.openIdForm.enable();
                this.samlForm.disable();
            } else if (newType === SsoType.Saml2) {
                this.openIdForm.disable();
                this.samlForm.enable();
            } else {
                this.openIdForm.disable();
                this.samlForm.disable();
            }
        });

        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        this.organization = await this.userService.getOrganization(this.organizationId);
        const ssoSettings = await this.apiService.getOrganizationSso(this.organizationId);
        this.apiToForm(ssoSettings);

        this.ssoUrls = ssoSettings.urls;

        this.keyConnectorUrl.markAsDirty();

        this.loading = false;
    }

    async submit() {
        if (this.ssoConfigForm.invalid) {
            return;
        }

        this.formPromise = this.postData();

        try {
            const response = await this.formPromise;
            this.apiToForm(response);
            this.platformUtilsService.showToast('success', null, this.i18nService.t('ssoSettingsSaved'));
        } catch {
            // Logged by appApiAction, do nothing
        }

        this.formPromise = null;
    }

    async postData() {
        if (this.commonData.get('keyConnectorEnabled').value) {
            await this.validateKeyConnectorUrl();

            if (this.keyConnectorUrl.hasError('invalidUrl')) {
                throw new Error(this.i18nService.t('keyConnectorTestFail'));
            }
        }

        const request = new OrganizationSsoRequest();
        request.enabled = this.enabled.value;
        request.data = this.formToApi();

        return this.apiService.postOrganizationSso(this.organizationId, request);
    }

    async validateKeyConnectorUrl() {
        if (this.keyConnectorUrl.pristine) {
            return;
        }

        this.keyConnectorUrl.markAsPending();

        try {
            await this.apiService.getKeyConnectorAlive(this.keyConnectorUrl.value);
            this.keyConnectorUrl.updateValueAndValidity();
        } catch {
            this.keyConnectorUrl.setErrors({
                invalidUrl: true,
            });
        }

        this.keyConnectorUrl.markAsPristine();
    }

    getErrorCount(form: FormGroup): number {
        return Object.values(form.controls).reduce((acc: number, control: AbstractControl) => {
            if (control instanceof FormGroup) {
                return acc + this.getErrorCount(control);
            }

            if (control.errors == null) {
                return acc + 0;
            }
            return acc + (Object.keys(control.errors).length);
        }, 0);
    }

    private apiToForm(ssoSettings: OrganizationSsoResponse) {
        this.commonData.patchValue(ssoSettings.data);
        this.samlForm.patchValue(ssoSettings.data);
        this.openIdForm.patchValue(ssoSettings.data);
        this.enabled.setValue(ssoSettings.enabled);
    }

    private formToApi() {
        const api = new SsoConfigApi();
        return Object.assign(api, this.commonData.value, this.samlForm.value, this.openIdForm.value);
    }
}
