import swal from 'sweetalert';

import { DeviceType } from 'jslib/enums/deviceType';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { Utils } from 'jslib/misc/utils';

export class WebPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string = 'web';

    private browserCache: DeviceType = null;

    constructor(private i18nService: I18nService) { }

    getDevice(): DeviceType {
        if (this.browserCache != null) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf(' Firefox/') !== -1 || navigator.userAgent.indexOf(' Gecko/') !== -1) {
            this.browserCache = DeviceType.FirefoxBrowser;
        } else if (navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = DeviceType.OperaBrowser;
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = DeviceType.EdgeBrowser;
        } else if (navigator.userAgent.indexOf(' Vivaldi/') !== -1) {
            this.browserCache = DeviceType.VivaldiBrowser;
        } else if (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
            this.browserCache = DeviceType.SafariBrowser;
        } else if ((window as any).chrome && navigator.userAgent.indexOf(' Chrome/') !== -1) {
            this.browserCache = DeviceType.ChromeBrowser;
        } else if (navigator.userAgent.indexOf(' Trident/') !== -1) {
            this.browserCache = DeviceType.IEBrowser;
        } else {
            this.browserCache = DeviceType.UnknownBrowser;
        }

        return this.browserCache;
    }

    getDeviceString(): string {
        const device = DeviceType[this.getDevice()].toLowerCase();
        return device.replace('browser', '');
    }

    isFirefox(): boolean {
        return this.getDevice() === DeviceType.FirefoxBrowser;
    }

    isChrome(): boolean {
        return this.getDevice() === DeviceType.ChromeBrowser;
    }

    isEdge(): boolean {
        return this.getDevice() === DeviceType.EdgeBrowser;
    }

    isOpera(): boolean {
        return this.getDevice() === DeviceType.OperaBrowser;
    }

    isVivaldi(): boolean {
        return this.getDevice() === DeviceType.VivaldiBrowser;
    }

    isSafari(): boolean {
        return this.getDevice() === DeviceType.SafariBrowser;
    }

    isIE(): boolean {
        return this.getDevice() === DeviceType.IEBrowser;
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

    lockTimeout(): number {
        return null;
    }

    launchUri(uri: string, options?: any): void {
        const a = document.createElement('a');
        a.href = uri;
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
        a.classList.add('d-none');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        let blob: Blob = null;
        if (blobOptions != null && !this.isIE()) {
            blob = new Blob([blobData], blobOptions);
        } else {
            blob = new Blob([blobData]);
        }
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
        return process.env.APPLICATION_VERSION || '-';
    }

    supportsU2f(win: Window): boolean {
        if (win != null && (win as any).u2f != null) {
            return true;
        }
        return (this.isChrome() || this.isOpera() || this.isVivaldi()) && !Utils.isMobileBrowser;
    }

    supportsDuo(): boolean {
        return true;
    }

    showToast(type: 'error' | 'success' | 'warning' | 'info', title: string, text: string, global?: any): void {
        throw new Error('showToast not implemented');
    }

    async showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string) {
        const buttons = [confirmText == null ? this.i18nService.t('ok') : confirmText];
        if (cancelText != null) {
            buttons.unshift(cancelText);
        }

        const contentDiv = document.createElement('div');
        if (type != null) {
            const icon = document.createElement('i');
            icon.classList.add('swal-custom-icon');
            switch (type) {
                case 'success':
                    icon.classList.add('fa', 'fa-check', 'text-success');
                    break;
                case 'warning':
                    icon.classList.add('fa', 'fa-warning', 'text-warning');
                    break;
                case 'error':
                    icon.classList.add('fa', 'fa-bolt', 'text-danger');
                    break;
                case 'info':
                    icon.classList.add('fa', 'fa-info-circle', 'text-info');
                    break;
                default:
                    break;
            }
            if (icon.classList.contains('fa')) {
                contentDiv.appendChild(icon);
            }
        }

        if (title != null) {
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('swal-title');
            titleDiv.appendChild(document.createTextNode(title));
            contentDiv.appendChild(titleDiv);
        }

        if (text != null) {
            const textDiv = document.createElement('div');
            textDiv.classList.add('swal-text');
            textDiv.appendChild(document.createTextNode(text));
            contentDiv.appendChild(textDiv);
        }

        const confirmed = await swal({
            content: { element: contentDiv },
            buttons: buttons,
        });
        return confirmed;
    }

    isDev(): boolean {
        return process.env.ENV === 'development';
    }

    isSelfHost(): boolean {
        return process.env.SELF_HOST.toString() === 'true';
    }

    copyToClipboard(text: string, options?: any): void {
        let win = window;
        let doc = window.document;
        if (options && (options.window || options.win)) {
            win = options.window || options.win;
            doc = win.document;
        } else if (options && options.doc) {
            doc = options.doc;
        }
        if ((win as any).clipboardData && (win as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            (win as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            let copyEl = doc.body;
            // For some reason copy command won't work in Firefox when modal is open if appending to body
            if (this.isFirefox() && doc.body.classList.contains('modal-open')) {
                copyEl = doc.body.querySelector<HTMLElement>('.modal');
            }
            copyEl.appendChild(textarea);
            textarea.select();
            try {
                // Security exception may be thrown by some browsers.
                doc.execCommand('copy');
            } catch (e) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', e);
            } finally {
                copyEl.removeChild(textarea);
            }
        }
    }
}
