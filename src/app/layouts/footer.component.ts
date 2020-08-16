import { Component, OnInit } from '@angular/core';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.component.html',
})
export class FooterComponent implements OnInit {
    version: string;
    year = '2015';

    constructor(private platformUtilsService: PlatformUtilsService) {}

    ngOnInit() {
        this.year = new Date().getFullYear().toString();
        this.version = this.platformUtilsService.getApplicationVersion();
    }
}
