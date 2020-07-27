import {
    Component,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import {
    ChangePasswordComponent as BaseChangePasswordComponent,
} from 'jslib/angular/components/change-password.component';

@Component({
    selector: 'app-change-password',
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent extends BaseChangePasswordComponent {

    constructor(apiService: ApiService, i18nService: I18nService,
        cryptoService: CryptoService, messagingService: MessagingService,
        userService: UserService, passwordGenerationService: PasswordGenerationService,
        platformUtilsService: PlatformUtilsService, folderService: FolderService,
        cipherService: CipherService, syncService: SyncService,
        policyService: PolicyService, router: Router, private route: ActivatedRoute) {
        super(apiService, i18nService, cryptoService, messagingService, userService, passwordGenerationService,
            platformUtilsService, folderService, cipherService, syncService, policyService, router);
    }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe((qParams) => {
            if (qParams.resetMasterPassword != null) {
                this.isChangePasswordNoCompare = qParams.resetMasterPassword;
            }

            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
        super.ngOnInit();
    }
}
