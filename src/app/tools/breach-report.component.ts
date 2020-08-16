import { Component, OnInit } from '@angular/core';

import { AuditService } from 'jslib/abstractions/audit.service';
import { UserService } from 'jslib/abstractions/user.service';
import { BreachAccountResponse } from 'jslib/models/response/breachAccountResponse';

@Component({
    selector: 'app-breach-report',
    templateUrl: 'breach-report.component.html',
})
export class BreachReportComponent implements OnInit {
    error = false;
    username: string;
    checkedUsername: string;
    breachedAccounts: BreachAccountResponse[] = [];
    formPromise: Promise<BreachAccountResponse[]>;

    constructor(private auditService: AuditService, private userService: UserService) {}

    async ngOnInit() {
        this.username = await this.userService.getEmail();
    }

    async submit() {
        this.error = false;
        this.username = this.username.toLowerCase();
        try {
            this.formPromise = this.auditService.breachedAccounts(this.username);
            this.breachedAccounts = await this.formPromise;
        } catch {
            this.error = true;
        }
        this.checkedUsername = this.username;
    }
}
