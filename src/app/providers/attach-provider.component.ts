import { Component, OnInit } from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { ProviderUserType } from 'jslib-common/enums/providerUserType';
import { Provider } from 'jslib-common/models/domain/provider';

import { ProviderAttachOrganizationRequest } from 'jslib-common/models/request/provider/providerAttachOrganizationRequest';

@Component({
    selector: 'provider-attach',
    templateUrl: 'attach-provider.component.html',
})
export class AttachProviderComponent implements OnInit {
    
    organizationId: string;

    formPromise: Promise<any>;

    provider: string;
    providers: Provider[];

    constructor(private i18nService: I18nService, private toasterService: ToasterService,
        private cryptoService: CryptoService, private userService: UserService) { }
    
    async ngOnInit() {
        this.providers = (await this.userService.getAllProviders()).filter(p => p.type === ProviderUserType.ProviderAdmin);
    }

    async submit() {
        const request = new ProviderAttachOrganizationRequest();
        request.organizationId = this.organizationId;
        request.key = key;

    }
}
