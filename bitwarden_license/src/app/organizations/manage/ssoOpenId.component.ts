import {
    Component,
    Input,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { OpenIdConnectRedirectBehavior } from 'jslib-common/enums/ssoEnums';

@Component({
    selector: 'app-org-manage-sso-openId',
    templateUrl: 'ssoOpenId.component.html',
})
export class SsoOpenIdComponent {
    @Input() openIdForm: FormGroup;
    @Input() callbackPath: string;
    @Input() signedOutCallbackPath: string;

    readonly connectRedirectOptions = [
        { name: 'Redirect GET', value: OpenIdConnectRedirectBehavior.RedirectGet },
        { name: 'Form POST', value: OpenIdConnectRedirectBehavior.FormPost },
    ];

    showCustomizations: boolean = false;

    constructor(private platformUtilsService: PlatformUtilsService) { }

    copy(value: string) {
        this.platformUtilsService.copyToClipboard(value);
    }

    launchUri(url: string) {
        this.platformUtilsService.launchUri(url);
    }

    toggleCustomizations() {
        this.showCustomizations = !this.showCustomizations;
    }
}
