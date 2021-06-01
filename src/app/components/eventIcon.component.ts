import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { StateService } from 'jslib/abstractions/state.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { DeviceType } from 'jslib/enums';
import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-events-icon',
    templateUrl: 'eventIcon.component.html',
})
export class EventIconComponent implements OnChanges {
    @Input() deviceType: DeviceType;
    @Input() fallbackIcon: string;
    image: string;
    imageEnabled: boolean;

    private iconsUrl: string;

    constructor(environmentService: EnvironmentService, protected stateService: StateService) {
        this.iconsUrl = environmentService.iconsUrl;
        if (!this.iconsUrl) {
            if (environmentService.baseUrl) {
                this.iconsUrl = environmentService.baseUrl + '/icons';
            } else {
                this.iconsUrl = 'https://icons.bitwarden.net';
            }
        }
    }

    async ngOnChanges() {
        this.imageEnabled = !(await this.stateService.get<boolean>(ConstantsService.disableFaviconKey));
        this.load();
    }

    protected load() {
        switch (this.deviceType) {
            case DeviceType.ChromeExtension:
            case DeviceType.ChromeBrowser:
                this.setLoginIcon('chrome.com');
                break;
            case DeviceType.FirefoxExtension:
            case DeviceType.FirefoxBrowser:
                this.setLoginIcon('firefox.com');
                break;
            case DeviceType.OperaExtension:
            case DeviceType.OperaBrowser:
                this.setLoginIcon('opera.com');
                break;
            case DeviceType.EdgeExtension:
            case DeviceType.WindowsDesktop:
            case DeviceType.EdgeBrowser:
            case DeviceType.IEBrowser:
                this.setLoginIcon('microsoft.com');
                break;
            case DeviceType.VivaldiExtension:
            case DeviceType.VivaldiBrowser:
                this.setLoginIcon('vivaldi.com');
                break;
            case DeviceType.SafariExtension:
            case DeviceType.MacOsDesktop:
            case DeviceType.SafariBrowser:
                this.setLoginIcon('apple.com');
                break;
            case DeviceType.Android:
            case DeviceType.iOS:
            case DeviceType.UWP:
            case DeviceType.LinuxDesktop:
            case DeviceType.UnknownBrowser:
            default:
                return;
        }
    }

    private setLoginIcon(hostnameUri: string) {
        if (hostnameUri) {
            let isWebsite = false;

            if (this.imageEnabled && hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('.') > -1) {
                hostnameUri = 'http://' + hostnameUri;
                isWebsite = true;
            } else if (this.imageEnabled) {
                isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > -1;
            }

            if (this.imageEnabled && isWebsite) {
                try {
                    this.image = this.iconsUrl + '/' + Utils.getHostname(hostnameUri) + '/icon.png';
                } catch (e) { }
            }
        } else {
            this.image = null;
        }
    }
}
