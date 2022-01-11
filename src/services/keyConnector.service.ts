import { Injectable } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TokenService } from "jslib-common/abstractions/token.service";

import { CMEIFrame } from "jslib-common/misc/cme_iframe";
import { KeyConnectorUserKeyRequest } from "jslib-common/models/request/keyConnectorUserKeyRequest";
import { KeyConnectorUserKeyResponse } from "jslib-common/models/response/keyConnectorUserKeyResponse";

import { KeyConnectorService as BaseKeyConnectorService } from "jslib-common/services/keyConnector.service";

@Injectable()
export class KeyConnectorService extends BaseKeyConnectorService {
  constructor(
    stateService: StateService,
    cryptoFunctionService: CryptoFunctionService,
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    logService: LogService,
    organizationService: OrganizationService,
    private environmentService: EnvironmentService,
    private platformUtilsService: PlatformUtilsService
  ) {
    super(
      stateService,
      cryptoFunctionService,
      cryptoService,
      apiService,
      tokenService,
      logService,
      organizationService
    );
  }

  async getUserKeyFromKeyConnector(url: string): Promise<KeyConnectorUserKeyResponse> {
    if (this.platformUtilsService.isSelfHost()) {
      return super.getUserKeyFromKeyConnector(url);
    }

    const el = document.createElement("iframe");
    el.id = "cme_iframe";
    document.body.appendChild(el);

    const webVaultUrl = this.environmentService.getWebVaultUrl();

    const promise: Promise<KeyConnectorUserKeyResponse> = new Promise(async (resolve) => {
      const iframe = new CMEIFrame(
        window,
        webVaultUrl,
        (key: string) => {
          resolve(new KeyConnectorUserKeyResponse({ Key: key }));
        },
        (error: string) => {
          this.platformUtilsService.showToast("error", null, error);
        },
        (info: string) => {
          this.logService.info(info);
        }
      );

      iframe.init(await this.apiService.getActiveBearerToken(), url);
    });

    promise.finally(() => el.remove());

    return promise;
  }

  postUserKeyToKeyConnector(url: string, request: KeyConnectorUserKeyRequest) {
    if (this.platformUtilsService.isSelfHost()) {
      return super.postUserKeyToKeyConnector(url, request);
    }

    const el = document.createElement("iframe");
    el.id = "cme_iframe";
    document.body.appendChild(el);

    const webVaultUrl = this.environmentService.getWebVaultUrl();

    const promise: Promise<void> = new Promise(async (resolve) => {
      const iframe = new CMEIFrame(
        window,
        webVaultUrl,
        () => {
          resolve();
        },
        (error: string) => {
          this.platformUtilsService.showToast("error", null, error);
        },
        (info: string) => {
          this.logService.info(info);
        }
      );

      iframe.initPost(await this.apiService.getActiveBearerToken(), url, request.key);
    });

    promise.finally(() => el.remove());

    return promise;
  }
}
