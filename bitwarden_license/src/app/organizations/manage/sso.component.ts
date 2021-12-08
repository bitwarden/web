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
    dirtyRequired,
    dirtyRequiredIf,
} from 'jslib-angular/validators/dirty.validator';

import {
    OpenIdConnectRedirectBehavior,
    Saml2BindingType,
    Saml2NameIdFormat,
    Saml2SigningBehavior,
    SsoType,
} from 'jslib-common/enums/ssoEnums';
import { SsoConfigView } from 'jslib-common/models/view/ssoConfigView';

const defaultSigningAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

@Component({
    selector: 'app-org-manage-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent implements OnInit {

    get enableTestKeyConnector() {
        return this.ssoConfigForm.get('keyConnectorEnabled').value &&
            this.keyConnectorUrl != null &&
            this.keyConnectorUrl.value !== '';
    }

    get keyConnectorUrl() {
        return this.ssoConfigForm.get('keyConnectorUrl');
    }

    readonly ssoTypeOptions = [
        { name: this.i18nService.t('selectType'), value: SsoType.None, disabled: true },
        { name: 'OpenID Connect', value: SsoType.OpenIdConnect },
        { name: 'SAML 2.0', value: SsoType.Saml2 },
    ];

    readonly ssoType = SsoType;

    loading = true;
    haveTestedKeyConnector = false;
    organizationId: string;
    organization: Organization;
    formPromise: Promise<any>;

    ssoUrls: SsoUrls;

    enabled = this.fb.control(false);

    openIdForm = this.fb.group({
        authority: ['', dirtyRequired()],
        clientId: ['', dirtyRequired()],
        clientSecret: ['', dirtyRequired()],
        metadataAddress: [],
        redirectBehavior: [OpenIdConnectRedirectBehavior.RedirectGet],
        getClaimsFromUserInfoEndpoint: [],
        additionalScopes: [],
        additionalUserIdClaimTypes: [],
        additionalEmailClaimTypes: [],
        additionalNameClaimTypes: [],
        acrValues: [],
        expectedReturnAcrValue: [],
    });

    samlForm = this.fb.group({
        spNameIdFormat: [Saml2NameIdFormat.NotConfigured],
        spOutboundSigningAlgorithm: [defaultSigningAlgorithm],
        spSigningBehavior: [Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned],
        spMinIncomingSigningAlgorithm: [defaultSigningAlgorithm],
        spWantAssertionsSigned: [],
        spValidateCertificates: [],

        idpEntityId: ['', dirtyRequired()],
        idpBindingType: [Saml2BindingType.HttpRedirect],
        idpSingleSignOnServiceUrl: [],
        idpSingleLogoutServiceUrl: [],
        idpArtifactResolutionServiceUrl: ['', dirtyRequiredIf(
            control => control.parent?.get('idpBindingType').value === Saml2BindingType.Artifact)],
        idpX509PublicCert: ['', dirtyRequired()],
        idpOutboundSigningAlgorithm: [defaultSigningAlgorithm],
        idpAllowUnsolicitedAuthnResponse: [],
        idpAllowOutboundLogoutRequests: [true],
        idpWantAuthnRequestsSigned: [],
    });

    ssoConfigForm = this.fb.group({
        configType: [SsoType.None, {updateOn: 'change'}],
        keyConnectorEnabled: [false, {updateOn: 'change'}],
        keyConnectorUrl: [''],
        openId: this.openIdForm,
        saml: this.samlForm,
    }, {
        updateOn: 'blur',
    });

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private userService: UserService) { }

    async ngOnInit() {
        this.ssoConfigForm.get('configType').valueChanges.subscribe((newType: SsoType) => {
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
        this.populateForm(ssoSettings);

        this.ssoUrls = ssoSettings.urls;

        this.loading = false;
    }

    async submit() {
        this.validateForm(this.ssoConfigForm);

        if (this.ssoConfigForm.get('keyConnectorEnabled').value) {
            await this.validateKeyConnectorUrl();
        }

        if (!this.ssoConfigForm.valid) {
            return;
        }

        const request = new OrganizationSsoRequest();
        request.enabled = this.enabled.value;
        request.data = SsoConfigApi.fromView(this.ssoConfigForm.value as SsoConfigView);

        this.formPromise = this.apiService.postOrganizationSso(this.organizationId, request);

        try {
            const response = await this.formPromise;
            this.populateForm(response);
            this.platformUtilsService.showToast('success', null, this.i18nService.t('ssoSettingsSaved'));
        } catch {
            // Logged by appApiAction, do nothing
        }

        this.formPromise = null;
    }

    async validateKeyConnectorUrl() {
        if (this.haveTestedKeyConnector) {
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

        this.haveTestedKeyConnector = true;
    }

    getErrorCount(form: FormGroup): number {
        return Object.values(form.controls).reduce((acc: number, control: AbstractControl) => {
            if (control instanceof FormGroup) {
                return acc + this.getErrorCount(control);
            }

            if (control.errors == null) {
                return acc;
            }
            return acc + (Object.keys(control.errors).length);
        }, 0);
    }

    private validateForm(form: FormGroup) {
        Object.values(form.controls).forEach((control: AbstractControl) => {
            if (control.disabled) {
                return;
            }

            if (control instanceof FormGroup) {
                this.validateForm(control);
            } else {
                control.markAsDirty();
                control.markAsTouched();
                control.updateValueAndValidity();
            }
        });
    }

    private populateForm(ssoSettings: OrganizationSsoResponse) {
        this.enabled.setValue(ssoSettings.enabled);

        if (ssoSettings.data.configType != SsoType.None) {
            const ssoConfigView = new SsoConfigView(ssoSettings.data);
            this.ssoConfigForm.patchValue(ssoConfigView);
        }
    }
}
