import { StorageService } from 'jslib/abstractions/storage.service';
import { ConstantsService } from 'jslib/services';

export class WebStorageService implements StorageService {
    private memoryStore = new Map<string, any>();
    private memoryKeys = new Set(['key']);
    private localStorageKeys = new Set(['appId', 'anonymousAppId', 'rememberedEmail',
        ConstantsService.disableFaviconKey, ConstantsService.lockOptionKey, ConstantsService.localeKey,
        ConstantsService.lockOptionKey]);

    get<T>(key: string): Promise<T> {
        if (this.memoryKeys.has(key)) {
            if (this.memoryStore.has(key)) {
                const obj = this.memoryStore.get(key);
                return Promise.resolve(obj as T);
            }
        } else {
            let json: string = null;
            if (this.localStorageKeys.has(key)) {
                json = window.localStorage.getItem(key);
            } else {
                json = window.sessionStorage.getItem(key);
            }
            if (json != null) {
                const obj = JSON.parse(json);
                return Promise.resolve(obj as T);
            }
        }
        return Promise.resolve(null);
    }

    save(key: string, obj: any): Promise<any> {
        if (obj == null) {
            return this.remove(key);
        }

        if (this.memoryKeys.has(key)) {
            this.memoryStore.set(key, obj);
        } else {
            const json = JSON.stringify(obj);
            if (this.localStorageKeys.has(key)) {
                window.localStorage.setItem(key, json);
            } else {
                window.sessionStorage.setItem(key, json);
            }
        }
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        if (this.memoryKeys.has(key)) {
            this.memoryStore.delete(key);
        } else if (this.localStorageKeys.has(key)) {
            window.localStorage.removeItem(key);
        } else {
            window.sessionStorage.removeItem(key);
        }
        return Promise.resolve();
    }
}
