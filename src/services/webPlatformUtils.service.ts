import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';

import { DeviceType } from 'jslib/enums/deviceType';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { Utils } from 'jslib/misc/utils';

// Hack due to Angular 5.2 bug
const swal: SweetAlert = _swal as any;

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
        return 15;
    }

    launchUri(uri: string, options?: any): void {
        const a = document.createElement('a');
        a.href = uri;
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
        a.click();
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
        return (this.isChrome() || this.isOpera() || this.isVivaldi()) && !this.isMobile(win);
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

    private isMobile(win: Window) {
        let mobile = false;
        ((a) => {
            // tslint:disable-next-line
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
                mobile = true;
            }
        })(win.navigator.userAgent || win.navigator.vendor || (win as any).opera);

        return mobile || win.navigator.userAgent.match(/iPad/i) != null;
    }
}
