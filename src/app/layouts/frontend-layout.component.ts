import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

@Component({
    selector: 'app-frontend-layout',
    templateUrl: 'frontend-layout.component.html',
})
export class FrontendLayoutComponent implements OnInit, OnDestroy {
    version: string;

    constructor(private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        this.version = this.platformUtilsService.getApplicationVersion();
        document.body.classList.add('layout_frontend');
    }

    ngOnDestroy() {
        document.body.classList.remove('layout_frontend');
    }
}
