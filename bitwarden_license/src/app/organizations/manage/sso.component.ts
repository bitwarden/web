import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { SelectOptions } from "jslib-angular/interfaces/selectOptions";
import { dirtyRequired } from "jslib-angular/validators/dirty.validator";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import {
  OpenIdConnectRedirectBehavior,
  Saml2BindingType,
  Saml2NameIdFormat,
  Saml2SigningBehavior,
  SsoType,
} from "jslib-common/enums/ssoEnums";
import { Utils } from "jslib-common/misc/utils";
import { SsoConfigApi } from "jslib-common/models/api/ssoConfigApi";
import { Organization } from "jslib-common/models/domain/organization";
import { OrganizationSsoRequest } from "jslib-common/models/request/organization/organizationSsoRequest";
import { OrganizationSsoResponse } from "jslib-common/models/response/organization/organizationSsoResponse";
import { SsoConfigView } from "jslib-common/models/view/ssoConfigView";

const defaultSigningAlgorithm = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";

@Component({
  selector: "app-org-manage-sso",
  templateUrl: "sso.component.html",
})
export class SsoComponent implements OnInit {
  readonly ssoType = SsoType;

  readonly ssoTypeOptions: SelectOptions[] = [
    { name: this.i18nService.t("selectType"), value: SsoType.None, disabled: true },
    { name: "OpenID Connect", value: SsoType.OpenIdConnect },
    { name: "SAML 2.0", value: SsoType.Saml2 },
  ];

  readonly samlSigningAlgorithms = [
    "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha384",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha512",
    "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
  ];

  readonly saml2SigningBehaviourOptions: SelectOptions[] = [
    {
      name: "If IdP Wants Authn Requests Signed",
      value: Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned,
    },
    { name: "Always", value: Saml2SigningBehavior.Always },
    { name: "Never", value: Saml2SigningBehavior.Never },
  ];
  readonly saml2BindingTypeOptions: SelectOptions[] = [
    { name: "Redirect", value: Saml2BindingType.HttpRedirect },
    { name: "HTTP POST", value: Saml2BindingType.HttpPost },
  ];
  readonly saml2NameIdFormatOptions: SelectOptions[] = [
    { name: "Not Configured", value: Saml2NameIdFormat.NotConfigured },
    { name: "Unspecified", value: Saml2NameIdFormat.Unspecified },
    { name: "Email Address", value: Saml2NameIdFormat.EmailAddress },
    { name: "X.509 Subject Name", value: Saml2NameIdFormat.X509SubjectName },
    { name: "Windows Domain Qualified Name", value: Saml2NameIdFormat.WindowsDomainQualifiedName },
    { name: "Kerberos Principal Name", value: Saml2NameIdFormat.KerberosPrincipalName },
    { name: "Entity Identifier", value: Saml2NameIdFormat.EntityIdentifier },
    { name: "Persistent", value: Saml2NameIdFormat.Persistent },
    { name: "Transient", value: Saml2NameIdFormat.Transient },
  ];

  readonly connectRedirectOptions: SelectOptions[] = [
    { name: "Redirect GET", value: OpenIdConnectRedirectBehavior.RedirectGet },
    { name: "Form POST", value: OpenIdConnectRedirectBehavior.FormPost },
  ];

  showOpenIdCustomizations = false;

  loading = true;
  haveTestedKeyConnector = false;
  organizationId: string;
  organization: Organization;
  formPromise: Promise<any>;

  callbackPath: string;
  signedOutCallbackPath: string;
  spEntityId: string;
  spMetadataUrl: string;
  spAcsUrl: string;

  enabled = this.formBuilder.control(false);

  openIdForm = this.formBuilder.group(
    {
      authority: ["", dirtyRequired],
      clientId: ["", dirtyRequired],
      clientSecret: ["", dirtyRequired],
      metadataAddress: [],
      redirectBehavior: [OpenIdConnectRedirectBehavior.RedirectGet, dirtyRequired],
      getClaimsFromUserInfoEndpoint: [],
      additionalScopes: [],
      additionalUserIdClaimTypes: [],
      additionalEmailClaimTypes: [],
      additionalNameClaimTypes: [],
      acrValues: [],
      expectedReturnAcrValue: [],
    },
    {
      updateOn: "blur",
    }
  );

  samlForm = this.formBuilder.group(
    {
      spNameIdFormat: [Saml2NameIdFormat.NotConfigured],
      spOutboundSigningAlgorithm: [defaultSigningAlgorithm],
      spSigningBehavior: [Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned],
      spMinIncomingSigningAlgorithm: [defaultSigningAlgorithm],
      spWantAssertionsSigned: [],
      spValidateCertificates: [],

      idpEntityId: ["", dirtyRequired],
      idpBindingType: [Saml2BindingType.HttpRedirect],
      idpSingleSignOnServiceUrl: [],
      idpSingleLogoutServiceUrl: [],
      idpX509PublicCert: ["", dirtyRequired],
      idpOutboundSigningAlgorithm: [defaultSigningAlgorithm],
      idpAllowUnsolicitedAuthnResponse: [],
      idpAllowOutboundLogoutRequests: [true],
      idpWantAuthnRequestsSigned: [],
    },
    {
      updateOn: "blur",
    }
  );

  ssoConfigForm = this.formBuilder.group({
    configType: [SsoType.None],
    keyConnectorEnabled: [false],
    keyConnectorUrl: [""],
    openId: this.openIdForm,
    saml: this.samlForm,
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
    this.ssoConfigForm.get("configType").valueChanges.subscribe((newType: SsoType) => {
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

    this.samlForm
      .get("spSigningBehavior")
      .valueChanges.subscribe(() =>
        this.samlForm.get("idpX509PublicCert").updateValueAndValidity()
      );

    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
    });
  }

  async load() {
    this.organization = await this.organizationService.get(this.organizationId);
    const ssoSettings = await this.apiService.getOrganizationSso(this.organizationId);
    this.populateForm(ssoSettings);

    this.callbackPath = ssoSettings.urls.callbackPath;
    this.signedOutCallbackPath = ssoSettings.urls.signedOutCallbackPath;
    this.spEntityId = ssoSettings.urls.spEntityId;
    this.spMetadataUrl = ssoSettings.urls.spMetadataUrl;
    this.spAcsUrl = ssoSettings.urls.spAcsUrl;

    this.loading = false;
  }

  async submit() {
    this.validateForm(this.ssoConfigForm);

    if (this.ssoConfigForm.get("keyConnectorEnabled").value) {
      await this.validateKeyConnectorUrl();
    }

    if (!this.ssoConfigForm.valid) {
      this.readOutErrors();
      return;
    }

    const request = new OrganizationSsoRequest();
    request.enabled = this.enabled.value;
    request.data = SsoConfigApi.fromView(this.ssoConfigForm.value as SsoConfigView);

    this.formPromise = this.apiService.postOrganizationSso(this.organizationId, request);

    try {
      const response = await this.formPromise;
      this.populateForm(response);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("ssoSettingsSaved"));
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

  toggleOpenIdCustomizations() {
    this.showOpenIdCustomizations = !this.showOpenIdCustomizations;
  }

  getErrorCount(form: FormGroup): number {
    return Object.values(form.controls).reduce((acc: number, control: AbstractControl) => {
      if (control instanceof FormGroup) {
        return acc + this.getErrorCount(control);
      }

      if (control.errors == null) {
        return acc;
      }
      return acc + Object.keys(control.errors).length;
    }, 0);
  }

  get enableTestKeyConnector() {
    return (
      this.ssoConfigForm.get("keyConnectorEnabled").value &&
      !Utils.isNullOrWhitespace(this.keyConnectorUrl?.value)
    );
  }

  get keyConnectorUrl() {
    return this.ssoConfigForm.get("keyConnectorUrl");
  }

  get samlSigningAlgorithmOptions(): SelectOptions[] {
    return this.samlSigningAlgorithms.map((algorithm) => ({ name: algorithm, value: algorithm }));
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
    if (ssoSettings.data != null) {
      const ssoConfigView = new SsoConfigView(ssoSettings.data);
      this.ssoConfigForm.patchValue(ssoConfigView);
    }
  }

  private readOutErrors() {
    const errorText = this.i18nService.t("error");
    const errorCount = this.getErrorCount(this.ssoConfigForm);
    const errorCountText = this.i18nService.t(
      errorCount === 1 ? "formErrorSummarySingle" : "formErrorSummaryPlural",
      errorCount.toString()
    );

    const div = document.createElement("div");
    div.className = "sr-only";
    div.id = "srErrorCount";
    div.setAttribute("aria-live", "polite");
    div.innerText = errorText + ": " + errorCountText;

    const existing = document.getElementById("srErrorCount");
    if (existing != null) {
      existing.remove();
    }

    document.body.append(div);
  }
}
