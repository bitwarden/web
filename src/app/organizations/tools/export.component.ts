import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { ExportService } from 'jslib/abstractions/export.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { ExportComponent as BaseExportComponent } from '../../tools/export.component';

@Component({
    selector: 'app-org-export',
    templateUrl: '../../tools/export.component.html',
})
export class ExportComponent extends BaseExportComponent {
    organizationId: string;

    constructor(analytics: Angulartics2, toasterService: ToasterService,
        cryptoService: CryptoService, userService: UserService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        exportService: ExportService, private route: ActivatedRoute, ) {
        super(analytics, toasterService, cryptoService, userService, i18nService, platformUtilsService,
            exportService);
    }

    ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
        });
    }

    getExportData() {
        return this.exportService.getOrganizationExport(this.organizationId, 'csv');
    }

    getFileName() {
        return super.getFileName('org');
    }
}
