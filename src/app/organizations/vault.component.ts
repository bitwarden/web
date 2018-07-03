import {
    Component,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-org-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit {
    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {

        });
    }
}
