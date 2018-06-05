import { DeviceType } from 'jslib/enums/deviceType';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { AnalyticsIds } from 'jslib/misc/analytics';

const DialogPromiseExpiration = 600000; // 10 minutes

export class WebPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string = 'web';

    private showDialogResolves = new Map<number, { resolve: (value: boolean) => void, date: Date }>();
    private deviceCache: DeviceType = null;
    private analyticsIdCache: string = null;

    constructor(private messagingService: MessagingService) { }

    getDevice(): DeviceType {
        if (this.deviceCache) {
            return this.deviceCache;
        }

        if (navigator.userAgent.indexOf(' Firefox/') !== -1 || navigator.userAgent.indexOf(' Gecko/') !== -1) {
            this.deviceCache = DeviceType.Firefox;
        } else if (navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.deviceCache = DeviceType.Opera;
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.deviceCache = DeviceType.Edge;
        } else if (navigator.userAgent.indexOf(' Vivaldi/') !== -1) {
            this.deviceCache = DeviceType.Vivaldi;
        } else if (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            this.deviceCache = DeviceType.Safari;
        } else if ((window as any).chrome && navigator.userAgent.indexOf(' Chrome/') !== -1) {
            this.deviceCache = DeviceType.Chrome;
        }

        return this.deviceCache;
    }

    getDeviceString(): string {
        return DeviceType[this.getDevice()].toLowerCase();
    }

    isFirefox(): boolean {
        return this.getDevice() === DeviceType.Firefox;
    }

    isChrome(): boolean {
        return this.getDevice() === DeviceType.Chrome;
    }

    isEdge(): boolean {
        return this.getDevice() === DeviceType.Edge;
    }

    isOpera(): boolean {
        return this.getDevice() === DeviceType.Opera;
    }

    isVivaldi(): boolean {
        return this.getDevice() === DeviceType.Vivaldi;
    }

    isSafari(): boolean {
        return this.getDevice() === DeviceType.Safari;
    }

    isMacAppStore(): boolean {
        return false;
    }

    analyticsId(): string {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = (AnalyticsIds as any)[this.getDevice()];
        return this.analyticsIdCache;
    }

    getDomain(uriString: string): string {
        return uriString;
    }

    isViewOpen(): boolean {
        return false;
    }

    launchUri(uri: string, options?: any): void {
        //
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        //
    }

    getApplicationVersion(): string {
        return '1.2.3';
    }

    supportsU2f(win: Window): boolean {
        if (win != null && (win as any).u2f != null) {
            return true;
        }

        return this.isChrome() || this.isOpera();
    }

    supportsDuo(): boolean {
        return true;
    }

    showToast(type: 'error' | 'success' | 'warning' | 'info', title: string, text: string, global?: any): void {
        throw new Error('showToast not implemented');
    }

    showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string) {
        const dialogId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.messagingService.send('showDialog', {
            text: text,
            title: title,
            confirmText: confirmText,
            cancelText: cancelText,
            type: type,
            dialogId: dialogId,
        });
        return new Promise<boolean>((resolve) => {
            this.showDialogResolves.set(dialogId, { resolve: resolve, date: new Date() });
        });
    }

    isDev(): boolean {
        return process.env.ENV === 'development';
    }

    copyToClipboard(text: string, options?: any): void {
        const doc = options ? options.doc : window.document;
        if ((window as any).clipboardData && (window as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            (window as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            doc.body.appendChild(textarea);
            textarea.select();

            try {
                // Security exception may be thrown by some browsers.
                doc.execCommand('copy');
            } catch (e) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', e);
            } finally {
                doc.body.removeChild(textarea);
            }
        }
    }

    resolveDialogPromise(dialogId: number, confirmed: boolean) {
        if (this.showDialogResolves.has(dialogId)) {
            const resolveObj = this.showDialogResolves.get(dialogId);
            resolveObj.resolve(confirmed);
            this.showDialogResolves.delete(dialogId);
        }

        // Clean up old promises
        const deleteIds: number[] = [];
        this.showDialogResolves.forEach((val, key) => {
            const age = new Date().getTime() - val.date.getTime();
            if (age > DialogPromiseExpiration) {
                deleteIds.push(key);
            }
        });
        deleteIds.forEach((id) => {
            this.showDialogResolves.delete(id);
        });
    }
}
