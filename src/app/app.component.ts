import {
    ToasterConfig,
    ToasterContainerComponent,
} from 'angular2-toaster';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

import {
    Component,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    styles: [],
    template: `
        <router-outlet></router-outlet>`,
})
export class AppComponent {
    constructor() {
    }
}
