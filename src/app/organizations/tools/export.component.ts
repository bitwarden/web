import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EventService } from 'jslib/abstractions/event.service';
import { ExportService } from 'jslib/abstractions/export.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { ExportComponent as BaseExportComponent } from '../../tools/export.component';

@Component({
    selector: 'app-org-export',
    templateUrl: '../../tools/export.component.html',
})
export class ExportComponent extends BaseExportComponent {
    organizationId: string;

    constructor(
        cryptoService: CryptoService,
        i18nService: I18nService,
        platformUtilsService: PlatformUtilsService,
        exportService: ExportService,
        eventService: EventService,
        private route: ActivatedRoute
    ) {
        super(cryptoService, i18nService, platformUtilsService, exportService, eventService);
    }

    ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
        });
    }

    getExportData() {
        return this.exportService.getOrganizationExport(this.organizationId, this.format);
    }

    getFileName() {
        return super.getFileName('org');
    }

    async collectEvent(): Promise<any> {
        // TODO
        // await this.eventService.collect(EventType.Organization_ClientExportedVault);
    }
}
