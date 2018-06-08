import { StorageService } from 'jslib/abstractions/storage.service';

export class WebStorageService implements StorageService {
    get<T>(key: string): Promise<T> {
        const json = window.sessionStorage.getItem(key);
        if (json == null) {
            return Promise.resolve(null);
        }
        const obj = JSON.parse(json);
        return Promise.resolve(obj as T);
    }

    save(key: string, obj: any): Promise<any> {
        if (obj == null) {
            this.remove(key);
            return;
        }
        const json = JSON.stringify(obj);
        window.sessionStorage.setItem(key, json);
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        window.sessionStorage.removeItem(key);
        return Promise.resolve();
    }
}
