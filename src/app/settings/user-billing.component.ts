import {
    Component,
    OnInit,
} from '@angular/core';

import { TokenService } from 'jslib/abstractions/token.service';

@Component({
    selector: 'app-user-billing',
    templateUrl: 'user-billing.component.html',
})
export class UserBillingComponent implements OnInit {
    premium = false;

    constructor(private tokenService: TokenService) { }

    async ngOnInit() {
        this.loadPremiumStatus();
    }

    loadPremiumStatus() {
        this.premium = this.tokenService.getPremium();
    }
}
