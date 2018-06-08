import { DeviceType } from 'jslib/enums/deviceType';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { AnalyticsIds } from 'jslib/misc/analytics';
import { Utils } from 'jslib/misc/utils';

export class WebPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string = 'web';

    private browserCache: string = null;

    constructor(private messagingService: MessagingService) { }

    getDevice(): DeviceType {
        return DeviceType.Web;
    }

    getDeviceString(): string {
        return 'Web';
    }

    isFirefox(): boolean {
        return this.getBrowserType() === 'firefox';
    }

    isChrome(): boolean {
        return this.getBrowserType() === 'chrome';
    }

    isEdge(): boolean {
        return this.getBrowserType() === 'edge';
    }

    isOpera(): boolean {
        return this.getBrowserType() === 'opera';
    }

    isVivaldi(): boolean {
        return this.getBrowserType() === 'vivaldi';
    }

    isSafari(): boolean {
        return this.getBrowserType() === 'safari';
    }

    isIE(): boolean {
        return this.getBrowserType() === 'ie';
    }

    isMacAppStore(): boolean {
        return false;
    }

    analyticsId(): string {
        return 'UA-81915606-3';
    }

    getDomain(uriString: string): string {
        return Utils.getHostname(uriString);
    }

    isViewOpen(): boolean {
        return false;
    }

    launchUri(uri: string, options?: any): void {
        const a = document.createElement('a');
        a.href = uri;
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
        a.click();
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        const blob = new Blob([blobData], blobOptions);
        if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const a = win.document.createElement('a');
            a.href = win.URL.createObjectURL(blob);
            a.download = fileName;
            a.style.position = 'fixed';
            win.document.body.appendChild(a);
            a.click();
            win.document.body.removeChild(a);
        }
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
        return Promise.resolve(false);
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

    private getBrowserType(): string {
        if (this.browserCache != null) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf(' Firefox/') !== -1 || navigator.userAgent.indexOf(' Gecko/') !== -1) {
            this.browserCache = 'firefox';
        } else if (navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = 'opera';
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = 'edge';
        } else if (navigator.userAgent.indexOf(' Vivaldi/') !== -1) {
            this.browserCache = 'vivaldi';
        } else if (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            this.browserCache = 'safari';
        } else if ((window as any).chrome && navigator.userAgent.indexOf(' Chrome/') !== -1) {
            this.browserCache = 'chrome';
        } else if (navigator.userAgent.indexOf(' Trident/') !== -1) {
            this.browserCache = 'ie';
        }

        return this.browserCache;
    }
}
