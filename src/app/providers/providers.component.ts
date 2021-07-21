import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { Provider } from 'jslib-common/models/domain/provider';

import { Utils } from 'jslib-common/misc/utils';

@Component({
    selector: 'app-providers',
    templateUrl: 'providers.component.html',
})
export class ProvidersComponent implements OnInit {
    @Input() vault = false;

    providers: Provider[];
    loaded: boolean = false;
    actionPromise: Promise<any>;

    constructor(private userService: UserService, private i18nService: I18nService) { }

    async ngOnInit() {
        document.body.classList.remove('layout_frontend');
        await this.load();
    }

    async load() {
        const providers = await this.userService.getAllProviders();
        providers.sort(Utils.getSortFunction(this.i18nService, 'name'));
        this.providers = providers;
        this.loaded = true;
    }
}
