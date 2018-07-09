import {
    Component,
    Input,
    OnInit,
} from '@angular/core';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-callout',
    templateUrl: 'callout.component.html',
})
export class CalloutComponent implements OnInit {
    @Input() type = 'info';
    @Input() icon: string;
    @Input() title: string;

    calloutStyle: string;

    constructor(private i18nService: I18nService) { }

    ngOnInit() {
        this.calloutStyle = this.type;

        if (this.type === 'warning' || this.type === 'danger') {
            if (this.type === 'danger') {
                this.calloutStyle = 'danger';
            }
            if (this.title === undefined) {
                this.title = this.i18nService.t('warning');
            }
            if (this.icon === undefined) {
                this.icon = 'fa-warning';
            }
        } else if (this.type === 'error') {
            this.calloutStyle = 'danger';
            if (this.title === undefined) {
                this.title = this.i18nService.t('error');
            }
            if (this.icon === undefined) {
                this.icon = 'fa-bolt';
            }
        } else if (this.type === 'tip') {
            this.calloutStyle = 'success';
            if (this.title === undefined) {
                this.title = this.i18nService.t('tip');
            }
            if (this.icon === undefined) {
                this.icon = 'fa-lightbulb-o';
            }
        }
    }
}
