import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SEND_KDF_ITERATIONS } from "jslib-common/enums/kdfType";
import { SendType } from "jslib-common/enums/sendType";
import { Utils } from "jslib-common/misc/utils";
import { SendAccess } from "jslib-common/models/domain/sendAccess";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";
import { SendAccessRequest } from "jslib-common/models/request/sendAccessRequest";
import { ErrorResponse } from "jslib-common/models/response/errorResponse";
import { SendAccessResponse } from "jslib-common/models/response/sendAccessResponse";
import { SendAccessView } from "jslib-common/models/view/sendAccessView";

@Component({
  selector: "app-send-access",
  templateUrl: "access.component.html",
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
  hideEmail = false;

  private id: string;
  private key: string;
  private decKey: SymmetricCryptoKey;
  private accessRequest: SendAccessRequest;

  constructor(
    private i18nService: I18nService,
    private cryptoFunctionService: CryptoFunctionService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private route: ActivatedRoute,
    private cryptoService: CryptoService
  ) {}

  get sendText() {
    if (this.send == null || this.send.text == null) {
      return null;
    }
    return this.showText ? this.send.text.text : this.send.text.maskedText;
  }

  get expirationDate() {
    if (this.send == null || this.send.expirationDate == null) {
      return null;
    }
    return this.send.expirationDate;
  }

  get creatorIdentifier() {
    if (this.send == null || this.send.creatorIdentifier == null) {
      return null;
    }
    return this.send.creatorIdentifier;
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

    const downloadData = await this.apiService.getSendFileDownloadData(
      this.send,
      this.accessRequest
    );

    if (Utils.isNullOrWhitespace(downloadData.url)) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("missingSendFile"));
      return;
    }

    this.downloading = true;
    const response = await fetch(new Request(downloadData.url, { cache: "no-store" }));
    if (response.status !== 200) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
      this.downloading = false;
      return;
    }

    try {
      const buf = await response.arrayBuffer();
      const decBuf = await this.cryptoService.decryptFromBytes(buf, this.decKey);
      this.platformUtilsService.saveFile(window, decBuf, null, this.send.file.fileName);
    } catch (e) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }

    this.downloading = false;
  }

  copyText() {
    this.platformUtilsService.copyToClipboard(this.send.text.text);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("sendTypeText"))
    );
  }

  toggleText() {
    this.showText = !this.showText;
  }

  async load() {
    this.unavailable = false;
    this.error = false;
    this.hideEmail = false;
    const keyArray = Utils.fromUrlB64ToArray(this.key);
    this.accessRequest = new SendAccessRequest();
    if (this.password != null) {
      const passwordHash = await this.cryptoFunctionService.pbkdf2(
        this.password,
        keyArray,
        "sha256",
        SEND_KDF_ITERATIONS
      );
      this.accessRequest.password = Utils.fromBufferToB64(passwordHash);
    }
    try {
      let sendResponse: SendAccessResponse = null;
      if (this.loading) {
        sendResponse = await this.apiService.postSendAccess(this.id, this.accessRequest);
      } else {
        this.formPromise = this.apiService.postSendAccess(this.id, this.accessRequest);
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
    this.hideEmail =
      this.creatorIdentifier == null &&
      !this.passwordRequired &&
      !this.loading &&
      !this.unavailable;
  }
}
