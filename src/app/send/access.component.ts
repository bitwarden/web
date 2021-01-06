import {
    Component,
    OnInit,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib/abstractions/cryptoFunction.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { Utils } from 'jslib/misc/utils';

import { SymmetricCryptoKey } from 'jslib/models/domain/symmetricCryptoKey';
import { SendAccess } from 'jslib/models/domain/sendAccess';

import { SendAccessView } from 'jslib/models/view/sendAccessView';

import { SendType } from 'jslib/enums/sendType';
import { SendAccessRequest } from 'jslib/models/request/sendAccessRequest';
import { ErrorResponse } from 'jslib/models/response/errorResponse';

import { SendAccessResponse } from 'jslib/models/response/sendAccessResponse';

@Component({
    selector: 'app-send-access',
    templateUrl: 'access.component.html',
})
export class AccessComponent implements OnInit {
    send: SendAccessView;
    sendType = SendType;
    downloading = false;
    loading = true;
    passwordRequired = false;
    formPromise: Promise<SendAccessResponse>;
    password: string;
    showText = false;
    unavailable = false;
    error = false;

    private id: string;
    private key: string;
    private decKey: SymmetricCryptoKey;

    constructor(private i18nService: I18nService, private cryptoFunctionService: CryptoFunctionService,
        private apiService: ApiService, private platformUtilsService: PlatformUtilsService,
        private route: ActivatedRoute, private cryptoService: CryptoService) {
    }

    get sendText() {
        if (this.send == null || this.send.text == null) {
            return null;
        }
        return this.showText ? this.send.text.text : this.send.text.maskedText;
    }

    ngOnInit() {
        this.route.params.subscribe(async (params) => {
            this.id = params.sendId;
            this.key = params.key;
            if (this.key == null || this.id == null) {
                return;
            }
            await this.load();
        });
    }

    async download() {
        if (this.send == null || this.decKey == null) {
            return;
        }

        if (this.downloading) {
            return;
        }

        this.downloading = true;
        const response = await fetch(new Request(this.send.file.url, { cache: 'no-store' }));
        if (response.status !== 200) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('errorOccurred'));
            this.downloading = false;
            return;
        }

        try {
            const buf = await response.arrayBuffer();
            const decBuf = await this.cryptoService.decryptFromBytes(buf, this.decKey);
            this.platformUtilsService.saveFile(window, decBuf, null, this.send.file.fileName);
        } catch (e) {
            this.platformUtilsService.showToast('error', null, this.i18nService.t('errorOccurred'));
        }

        this.downloading = false;
    }

    copyText() {
        this.platformUtilsService.copyToClipboard(this.send.text.text);
        this.platformUtilsService.showToast('success', null,
            this.i18nService.t('valueCopied', this.i18nService.t('sendTypeText')));
    }

    toggleText() {
        this.showText = !this.showText;
    }

    async load() {
        this.unavailable = false;
        this.error = false;
        const keyArray = Utils.fromUrlB64ToArray(this.key);
        const accessRequest = new SendAccessRequest();
        if (this.password != null) {
            const passwordHash = await this.cryptoFunctionService.pbkdf2(this.password, keyArray, 'sha256', 100000);
            accessRequest.password = Utils.fromBufferToB64(passwordHash);
        }
        try {
            let sendResponse: SendAccessResponse = null;
            if (this.loading) {
                sendResponse = await this.apiService.postSendAccess(this.id, accessRequest);
            } else {
                this.formPromise = this.apiService.postSendAccess(this.id, accessRequest);
                sendResponse = await this.formPromise;
            }
            this.passwordRequired = false;
            const sendAccess = new SendAccess(sendResponse);
            this.decKey = await this.cryptoService.makeSendKey(keyArray);
            this.send = await sendAccess.decrypt(this.decKey);
            this.showText = this.send.text != null ? !this.send.text.hidden : true;
        } catch (e) {
            if (e instanceof ErrorResponse) {
                if (e.statusCode === 401) {
                    this.passwordRequired = true;
                } else if (e.statusCode === 404) {
                    this.unavailable = true;
                } else {
                    this.error = true;
                }
            }
        }
        this.loading = false;
    }
}
