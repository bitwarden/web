import { Component } from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { ImportService } from 'jslib-common/abstractions/import.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ImportComponent as BaseImportComponent } from '../../tools/import.component';

@Component({
    selector: 'app-org-import',
    templateUrl: '../../tools/import.component.html',
})
export class ImportComponent extends BaseImportComponent {
    organizationName: string;

    constructor(i18nService: I18nService, toasterService: ToasterService,
        importService: ImportService, router: Router, private route: ActivatedRoute,
        platformUtilsService: PlatformUtilsService,
        private userService: UserService) {
        super(i18nService, toasterService, importService, router, platformUtilsService);
    }

    async ngOnInit() {
        this.route.parent.parent.params.subscribe(async params => {
            this.organizationId = params.organizationId;
            this.successNavigate = ['organizations', this.organizationId, 'vault'];
            super.ngOnInit();
        });
        const organization = await this.userService.getOrganization(this.organizationId);
        this.organizationName = organization.name;
    }

    async submit() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('importWarning', this.organizationName),
            this.i18nService.t('warning'), this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return;
        }
        super.submit();
    }
}
