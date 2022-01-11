import { Injectable } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TokenService } from "jslib-common/abstractions/token.service";

import { CMEIFrame } from "jslib-common/misc/cme_iframe";
import { Utils } from "jslib-common/misc/utils";
import { SymmetricCryptoKey } from "jslib-common/models/domain/symmetricCryptoKey";

import { KeyConnectorService as BaseKeyConnectorService } from "jslib-common/services/keyConnector.service";

@Injectable()
export class KeyConnectorService extends BaseKeyConnectorService {
  constructor(
    stateService: StateService,
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    logService: LogService,
    organizationService: OrganizationService,
    private environmentService: EnvironmentService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService
  ) {
    super(stateService, cryptoService, apiService, tokenService, logService, organizationService);
  }

  async getAndSetKey(url: string): Promise<void> {
    const el = document.createElement("iframe");
    el.id = "cme_iframe";
    document.body.appendChild(el);

    const webVaultUrl = this.environmentService.getWebVaultUrl();

    const promise: Promise<void> = new Promise(async (resolve) => {
      const iframe = new CMEIFrame(
        window,
        webVaultUrl,
        (key: string) => {
          const keyArr = Utils.fromB64ToArray(key);
          const k = new SymmetricCryptoKey(keyArr);
          this.cryptoService.setKey(k).then(resolve);
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
}
