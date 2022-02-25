import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Organization } from "jslib-common/models/domain/organization";
import { OrganizationSsoRequest } from "jslib-common/models/request/organization/organizationSsoRequest";

@Component({
  selector: "app-org-manage-sso",
  templateUrl: "sso.component.html",
})
export class SsoComponent implements OnInit {
  samlSigningAlgorithms = [
    "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha384",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha512",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
  ];

  loading = true;
  organizationId: string;
  organization: Organization;
  formPromise: Promise<any>;

  callbackPath: string;
  signedOutCallbackPath: string;
  spEntityId: string;
  spMetadataUrl: string;
  spAcsUrl: string;

  enabled = this.formBuilder.control(false);
  data = this.formBuilder.group({
    configType: [],

    keyConnectorEnabled: [],
    keyConnectorUrl: [],

    // OpenId
    authority: [],
    clientId: [],
    clientSecret: [],
    metadataAddress: [],
    redirectBehavior: [],
    getClaimsFromUserInfoEndpoint: [],
    additionalScopes: [],
    additionalUserIdClaimTypes: [],
    additionalEmailClaimTypes: [],
    additionalNameClaimTypes: [],
    acrValues: [],
    expectedReturnAcrValue: [],

    // SAML
    spNameIdFormat: [],
    spOutboundSigningAlgorithm: [],
    spSigningBehavior: [],
    spMinIncomingSigningAlgorithm: [],
    spWantAssertionsSigned: [],
    spValidateCertificates: [],

    idpEntityId: [],
    idpBindingType: [],
    idpSingleSignOnServiceUrl: [],
    idpSingleLogoutServiceUrl: [],
    idpArtifactResolutionServiceUrl: [],
    idpX509PublicCert: [],
    idpOutboundSigningAlgorithm: [],
    idpAllowUnsolicitedAuthnResponse: [],
    idpDisableOutboundLogoutRequests: [],
    idpWantAuthnRequestsSigned: [],
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
    });
  }

  async load() {
    this.organization = await this.organizationService.get(this.organizationId);
    const ssoSettings = await this.apiService.getOrganizationSso(this.organizationId);

    this.data.patchValue(ssoSettings.data);
    this.enabled.setValue(ssoSettings.enabled);

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
    this.formPromise = this.postData();

    try {
      const response = await this.formPromise;

      this.data.patchValue(response.data);
      this.enabled.setValue(response.enabled);

      this.platformUtilsService.showToast("success", null, this.i18nService.t("ssoSettingsSaved"));
    } catch {
      // Logged by appApiAction, do nothing
    }

    this.formPromise = null;
  }

  async postData() {
    if (this.data.get("keyConnectorEnabled").value) {
      await this.validateKeyConnectorUrl();

      if (this.keyConnectorUrl.hasError("invalidUrl")) {
        throw new Error(this.i18nService.t("keyConnectorTestFail"));
      }
    }

    const request = new OrganizationSsoRequest();
    request.enabled = this.enabled.value;
    request.data = this.data.value;

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
    return (
      this.data.get("keyConnectorEnabled").value &&
      this.keyConnectorUrl != null &&
      this.keyConnectorUrl.value !== ""
    );
  }

  get keyConnectorUrl() {
    return this.data.get("keyConnectorUrl");
  }
}
