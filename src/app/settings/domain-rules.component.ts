import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';

@Component({
    selector: 'app-domain-rules',
    templateUrl: 'domain-rules.component.html',
})
export class DomainRulesComponent implements OnInit {
    loading = true;
    custom: string[] = [];
    global: string[] = [];
    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        private cryptoService: CryptoService, private messagingService: MessagingService) { }

    async ngOnInit() {
        const response = await this.apiService.getSettingsDomains();
        this.loading = false;
    }

    async submit() {

    }
}
