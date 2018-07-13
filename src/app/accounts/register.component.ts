import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

import { RegisterComponent as BaseRegisterComponent } from 'jslib/angular/components/register.component';

@Component({
    selector: 'app-register',
    templateUrl: 'register.component.html',
})
export class RegisterComponent extends BaseRegisterComponent {
    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, cryptoService: CryptoService,
        apiService: ApiService, private route: ActivatedRoute) {
        super(authService, router, analytics, toasterService, i18nService, cryptoService, apiService);
    }

    ngOnInit() {
        this.route.queryParams.subscribe((qParams) => {
            if (qParams.email != null && qParams.email.indexOf('@') > -1) {
                this.email = qParams.email;
            }
        });
    }
}
