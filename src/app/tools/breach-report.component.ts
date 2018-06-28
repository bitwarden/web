import {
    Component,
    OnInit,
} from '@angular/core';

import { AuditService } from 'jslib/abstractions/audit.service';
import { UserService } from 'jslib/abstractions/user.service';
import { BreachAccountResponse } from 'jslib/models/response/breachAccountResponse';

@Component({
    selector: 'app-breach-report',
    templateUrl: 'breach-report.component.html',
})
export class BreachReportComponent implements OnInit {
    loading = true;
    error = false;
    email: string;
    breachedAccounts: BreachAccountResponse[] = [];

    constructor(private auditService: AuditService, private userService: UserService) { }

    async ngOnInit() {
        this.loading = true;
        try {
            this.email = await this.userService.getEmail();
            this.breachedAccounts = await this.auditService.breachedAccounts(this.email);
        } catch {
            this.error = true;
        }
        this.loading = false;
    }
}
