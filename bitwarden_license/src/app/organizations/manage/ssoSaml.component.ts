import {
    Component,
    Input,
    OnInit,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
} from '@angular/forms';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import {
    Saml2BindingType,
    Saml2NameIdFormat,
    Saml2SigningBehavior,
} from 'jslib-common/enums/ssoEnums';

@Component({
    selector: 'app-org-manage-sso-saml',
    templateUrl: 'ssoSaml.component.html',
})
export class SsoSamlComponent implements OnInit {

    readonly samlSigningAlgorithms = [
        'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha384',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha512',
        'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    ];

    readonly saml2SigningBehaviourOptions = [
        { name: 'If IdP Wants Authn Requests Signed', value: Saml2SigningBehavior.IfIdpWantAuthnRequestsSigned },
        { name: 'Always', value: Saml2SigningBehavior.Always },
        { name: 'Never', value: Saml2SigningBehavior.Never},
    ];
    readonly saml2BindingTypeOptions = [
        {name: 'Redirect', value: Saml2BindingType.HttpRedirect },
        {name: 'HTTP POST', value: Saml2BindingType.HttpPost },
        {name: 'Artifact', value: Saml2BindingType.Artifact },
    ];
    readonly saml2NameIdFormatOptions = [
        { name: 'Not Configured', value: Saml2NameIdFormat.NotConfigured },
        { name: 'Unspecified', value: Saml2NameIdFormat.Unspecified },
        { name: 'Email Address', value: Saml2NameIdFormat.EmailAddress },
        { name: 'X.509 Subject Name', value: Saml2NameIdFormat.X509SubjectName },
        { name: 'Windows Domain Qualified Name', value: Saml2NameIdFormat.WindowsDomainQualifiedName },
        { name: 'Kerberos Principal Name', value: Saml2NameIdFormat.KerberosPrincipalName },
        { name: 'Entity Identifier', value: Saml2NameIdFormat.EntityIdentifier },
        { name: 'Persistent', value: Saml2NameIdFormat.Persistent },
        { name: 'Transient', value: Saml2NameIdFormat.Transient },
    ];

    @Input() samlForm: FormGroup;
    @Input() spEntityId: string;
    @Input() spMetadataUrl: string;
    @Input() spAcsUrl: string;

    constructor(private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.samlForm.get('idpBindingType').valueChanges.subscribe(() => {
            this.samlForm.get('idpArtifactResolutionServiceUrl').updateValueAndValidity();

        });

        this.samlForm.get('spSigningBehavior').valueChanges.subscribe(() =>
            this.samlForm.get('idpX509PublicCert').updateValueAndValidity());
    }

    copy(value: string) {
        this.platformUtilsService.copyToClipboard(value);
    }

    launchUri(url: string) {
        this.platformUtilsService.launchUri(url);
    }

    get x509HasRequiredError() {
        return this.samlForm.get('idpX509PublicCert').hasError('required');
    }

    get artifactUrlHasRequiredError() {
        return this.samlForm.get('idpArtifactResolutionServiceUrl').hasError('required');
    }
}
