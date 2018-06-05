import { StorageService } from 'jslib/abstractions/storage.service';

export class WebStorageService implements StorageService {
    private store: any = {};

    get<T>(key: string): Promise<T> {
        const val = this.store[key];
        if (val == null) {
            return Promise.resolve(null);
        }
        return Promise.resolve(val as T);
    }

    save(key: string, obj: any): Promise<any> {
        this.store[key] = obj;
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        delete this.store[key];
        return Promise.resolve();
    }

}
