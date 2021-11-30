import {
    Component,
    OnInit,
} from '@angular/core';
import {
    FormBuilder,
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
import { OrganizationSsoResponse } from 'jslib-common/models/response/organization/organizationSsoResponse';

import {
    Saml2BindingType,
    SsoType
} from 'jslib-common/enums/ssoEnums';

import { requiredIf } from '../../../../../src/app/validators/requiredIf.validator';

@Component({
    selector: 'app-org-manage-sso',
    templateUrl: 'sso.component.html',
})
export class SsoComponent implements OnInit {

    samlSigningAlgorithms = [
        'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha384',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha512',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    ];

    readonly ssoType = SsoType;

    loading = true;
    organizationId: string;
    organization: Organization;
    formPromise: Promise<any>;

    callbackPath: string;
    signedOutCallbackPath: string;
    spEntityId: string;
    spMetadataUrl: string;
    spAcsUrl: string;

    enabled = this.fb.control(false);

    openIdData = this.fb.group({
        authority: ['', Validators.required],
        clientId: ['', Validators.required],
        clientSecret: ['', Validators.required],
        metadataAddress: [],
        redirectBehavior: ['', Validators.required],
        getClaimsFromUserInfoEndpoint: [],
        additionalScopes: [],
        additionalUserIdClaimTypes: [],
        additionalEmailClaimTypes: [],
        additionalNameClaimTypes: [],
        acrValues: [],
        expectedReturnAcrValue: [],
    });

    samlData: any = this.fb.group({
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
            requiredIf('idpBindingType', bindingType => bindingType.value === Saml2BindingType.Artifact)],
        idpX509PublicCert: [],
        idpOutboundSigningAlgorithm: [],
        idpAllowUnsolicitedAuthnResponse: [],
        idpDisableOutboundLogoutRequests: [],
        idpWantAuthnRequestsSigned: [],
    });

    commonData = this.fb.group({
        configType: [0, {
            updateOn: 'change'
        }],

        keyConnectorEnabled: [],
        keyConnectorUrl: [],
    });

    ssoConfigForm = this.fb.group({
        openId: this.openIdData,
        saml: this.samlData,
        common: this.commonData,
    }, {
        updateOn: 'blur'
    });

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private apiService: ApiService,
        private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private userService: UserService) { }

    async ngOnInit() {
        this.commonData.get('configType').valueChanges.subscribe((newType: SsoType) => {
            if (newType === SsoType.OpenIdConnect) {
                this.openIdData.enable();
                this.samlData.disable();
            } else if (newType === SsoType.Saml2) {
                this.openIdData.disable();
                this.samlData.enable();
            } else {
                this.openIdData.disable();
                this.samlData.disable();
            }
        })

        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            await this.load();
        });
    }

    async load() {
        this.organization = await this.userService.getOrganization(this.organizationId);
        const ssoSettings = await this.apiService.getOrganizationSso(this.organizationId);
        this.apiToForm(ssoSettings);

        this.callbackPath = ssoSettings.urls.callbackPath;
        this.signedOutCallbackPath = ssoSettings.urls.signedOutCallbackPath;
        this.spEntityId = ssoSettings.urls.spEntityId;
        this.spMetadataUrl = ssoSettings.urls.spMetadataUrl;
        this.spAcsUrl = ssoSettings.urls.spAcsUrl;

        this.keyConnectorUrl.markAsDirty();

        this.loading = false;
    }

    copy(value: string) {
        this.platformUtilsService.copyToClipboard(value);
    }

    launchUri(url: string) {
        this.platformUtilsService.launchUri(url);
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

    get enableTestKeyConnector() {
        return this.commonData.get('keyConnectorEnabled').value &&
            this.keyConnectorUrl != null &&
            this.keyConnectorUrl.value !== '';
    }

    get keyConnectorUrl() {
        return this.commonData.get('keyConnectorUrl');
    }

    private apiToForm(ssoSettings: OrganizationSsoResponse) {
        this.commonData.patchValue(ssoSettings.data);
        this.samlData.patchValue(ssoSettings.data);
        this.openIdData.patchValue(ssoSettings.data);
        this.enabled.setValue(ssoSettings.enabled);
    }

    private formToApi() {
        const api = new SsoConfigApi();
        return Object.assign(api, this.commonData.value, this.samlData.value, this.openIdData.value);
    }
}
