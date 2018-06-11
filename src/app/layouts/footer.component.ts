import {
    Component,
    OnInit,
} from '@angular/core';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

@Component({
    selector: 'app-footer',
    templateUrl: 'footer.component.html',
})
export class FooterComponent implements OnInit {
    version: string;

    constructor(private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        this.version = this.platformUtilsService.getApplicationVersion();
    }
}
