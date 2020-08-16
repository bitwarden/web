import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { ImportService } from 'jslib/abstractions/import.service';

import { ImportComponent as BaseImportComponent } from '../../tools/import.component';

@Component({
    selector: 'app-org-import',
    templateUrl: '../../tools/import.component.html',
})
export class ImportComponent extends BaseImportComponent {
    constructor(
        i18nService: I18nService,
        analytics: Angulartics2,
        toasterService: ToasterService,
        importService: ImportService,
        router: Router,
        private route: ActivatedRoute
    ) {
        super(i18nService, analytics, toasterService, importService, router);
    }

    ngOnInit() {
        this.route.parent.parent.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            this.successNavigate = ['organizations', this.organizationId, 'vault'];
            super.ngOnInit();
        });
    }
}
