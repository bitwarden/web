import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { ConstantsService } from 'jslib/services';

export class HtmlStorageService implements StorageService {
    private localStorageKeys = new Set([
        'appId',
        'anonymousAppId',
        'rememberedEmail',
        'passwordGenerationOptions',
        ConstantsService.disableFaviconKey,
        'rememberEmail',
        'enableGravatars',
        'enableFullWidth',
        ConstantsService.localeKey,
        ConstantsService.autoConfirmFingerprints,
        ConstantsService.vaultTimeoutKey,
        ConstantsService.vaultTimeoutActionKey,
        ConstantsService.ssoCodeVerifierKey,
        ConstantsService.ssoStateKey,
    ]);
    private localStorageStartsWithKeys = [
        'twoFactorToken_',
        ConstantsService.collapsedGroupingsKey + '_',
    ];

    constructor(private platformUtilsService: PlatformUtilsService) {}

    async init() {
        // LockOption -> VaultTimeout (uses the same legacy string value for backwards compat)
        const vaultTimeout = await this.get<number>(ConstantsService.vaultTimeoutKey);
        if (vaultTimeout == null && !this.platformUtilsService.isDev()) {
            await this.save(ConstantsService.vaultTimeoutKey, 15);
        }

        // Default Action to lock
        const vaultTimeoutAction = await this.get<string>(ConstantsService.vaultTimeoutActionKey);
        if (vaultTimeoutAction == null) {
            await this.save(ConstantsService.vaultTimeoutActionKey, 'lock');
        }
    }

    get<T>(key: string): Promise<T> {
        let json: string = null;
        if (this.isLocalStorage(key)) {
            json = window.localStorage.getItem(key);
        } else {
            json = window.sessionStorage.getItem(key);
        }
        if (json != null) {
            const obj = JSON.parse(json);
            return Promise.resolve(obj as T);
        }
        return Promise.resolve(null);
    }

    save(key: string, obj: any): Promise<any> {
        if (obj == null) {
            return this.remove(key);
        }

        const json = JSON.stringify(obj);
        if (this.isLocalStorage(key)) {
            window.localStorage.setItem(key, json);
        } else {
            window.sessionStorage.setItem(key, json);
        }
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        if (this.isLocalStorage(key)) {
            window.localStorage.removeItem(key);
        } else {
            window.sessionStorage.removeItem(key);
        }
        return Promise.resolve();
    }

    private isLocalStorage(key: string): boolean {
        if (this.localStorageKeys.has(key)) {
            return true;
        }
        for (const swKey of this.localStorageStartsWithKeys) {
            if (key.startsWith(swKey)) {
                return true;
            }
        }
        return false;
    }
}
