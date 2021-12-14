import { Injectable } from '@angular/core';

import { StorageService } from 'jslib-common/abstractions/storage.service';

import { HtmlStorageLocation } from 'jslib-common/enums/htmlStorageLocation';

import { GlobalState } from 'jslib-common/models/domain/globalState';
import { State } from 'jslib-common/models/domain/state';
import { StorageOptions } from 'jslib-common/models/domain/storageOptions';

@Injectable()
export class HtmlStorageService implements StorageService {

    get defaultOptions(): StorageOptions {
        return { htmlStorageLocation: HtmlStorageLocation.Session };
    }

    async init() {
        const state = await this.get<State>('state', { htmlStorageLocation: HtmlStorageLocation.Local }) ?? new State();
        state.globals = state.globals ?? new GlobalState();
        state.globals.vaultTimeout = state.globals.vaultTimeout ?? 15;
        state.globals.vaultTimeoutAction = state.globals.vaultTimeoutAction ?? 'lock';
        await this.save('state', state, { htmlStorageLocation: HtmlStorageLocation.Local });
    }

    get<T>(key: string, options: StorageOptions = this.defaultOptions): Promise<T> {
        let json: string = null;
        switch (options.htmlStorageLocation) {
            case HtmlStorageLocation.Local:
                json = window.localStorage.getItem(key);
                break;
            case HtmlStorageLocation.Session:
                 default:
                json = window.sessionStorage.getItem(key);
                break;
        }

        if (json != null) {
            const obj = JSON.parse(json);
            return Promise.resolve(obj as T);
        }
        return Promise.resolve(null);
    }

    async has(key: string, options: StorageOptions = this.defaultOptions): Promise<boolean> {
        return await this.get(key, options) != null;
    }

    save(key: string, obj: any, options: StorageOptions = this.defaultOptions): Promise<any> {
        if (obj == null) {
            return this.remove(key, options);
        }

        if (obj instanceof Set) {
            obj = Array.from(obj);
        }

        const json = JSON.stringify(obj);
        switch (options.htmlStorageLocation) {
            case HtmlStorageLocation.Local:
                window.localStorage.setItem(key, json);
                break;
            case HtmlStorageLocation.Session:
                 default:
                window.sessionStorage.setItem(key, json);
                break;
        }
        return Promise.resolve();
    }

    remove(key: string, options: StorageOptions = this.defaultOptions): Promise<any> {
        switch (options.htmlStorageLocation) {
            case HtmlStorageLocation.Local:
                window.localStorage.removeItem(key);
                break;
            case HtmlStorageLocation.Session:
                 default:
                window.sessionStorage.removeItem(key);
                break;
        }
        return Promise.resolve();
    }
}
