import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { StorageKey } from 'jslib-common/enums/storageKey';

export class HtmlStorageService implements StorageService {
    private localStorageKeys = new Set(['appId', 'anonymousAppId', 'rememberedEmail', 'passwordGenerationOptions',
        StorageKey.DisableFavicon, 'rememberEmail', 'enableGravatars', 'enableFullWidth',
        StorageKey.Locale, StorageKey.AutoConfirmFingerprints,
        StorageKey.VaultTimeout, StorageKey.VaultTimeoutAction, StorageKey.SsoCodeVerifier,
        StorageKey.SsoState, 'ssoOrgIdentifier', StorageKey.Theme]);
    private localStorageStartsWithKeys = ['twoFactorToken_', StorageKey.CollapsedGroupings + '_'];
    private memoryStorageStartsWithKeys = ['ciphers_', 'folders_', 'collections_', 'settings_', 'lastSync_'];
    private memoryStorage = new Map<string, string>();

    constructor(private platformUtilsService: PlatformUtilsService) { }

    async init() {
        // LockOption -> VaultTimeout (uses the same legacy string value for backwards compat)
        const vaultTimeout = await this.get<number>(StorageKey.VaultTimeout);
        if (vaultTimeout == null && !this.platformUtilsService.isDev()) {
            await this.save(StorageKey.VaultTimeout, 15);
        }

        // Default Action to lock
        const vaultTimeoutAction = await this.get<string>(StorageKey.VaultTimeoutAction);
        if (vaultTimeoutAction == null) {
            await this.save(StorageKey.VaultTimeoutAction, 'lock');
        }
    }

    get<T>(key: string): Promise<T> {
        let json: string = null;
        if (this.isLocalStorage(key)) {
            json = window.localStorage.getItem(key);
        } else if (this.isMemoryStorage(key)) {
            json = this.memoryStorage.get(key);
        } else {
            json = window.sessionStorage.getItem(key);
        }
        if (json != null) {
            const obj = JSON.parse(json);
            return Promise.resolve(obj as T);
        }
        return Promise.resolve(null);
    }

    async has(key: string): Promise<boolean> {
        return await this.get(key) != null;
    }

    save(key: string, obj: any): Promise<any> {
        if (obj == null) {
            return this.remove(key);
        }

        if (obj instanceof Set) {
            obj = Array.from(obj);
        }

        const json = JSON.stringify(obj);
        if (this.isLocalStorage(key)) {
            window.localStorage.setItem(key, json);
        } else if (this.isMemoryStorage(key)) {
            this.memoryStorage.set(key, json);
        } else {
            window.sessionStorage.setItem(key, json);
        }
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        if (this.isLocalStorage(key)) {
            window.localStorage.removeItem(key);
        } else if (this.isMemoryStorage(key)) {
            this.memoryStorage.delete(key);
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

    private isMemoryStorage(key: string): boolean {
        for (const swKey of this.memoryStorageStartsWithKeys) {
            if (key.startsWith(swKey)) {
                return true;
            }
        }
        return false;
    }
}
