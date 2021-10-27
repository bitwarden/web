import {
    Component,
    OnInit,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'jslib-common/abstractions/user.service';

@Component({
    selector: 'app-tools-router',
    templateUrl: 'tools-router.component.html',
})
export class ToolsRouterComponent implements OnInit {
    constructor(private route: ActivatedRoute, private router: Router,
        private userService: UserService) {}

    ngOnInit() {
        this.route.params.subscribe(async params => {
            console.log('Routing...');
            const org = await this.userService.getOrganization(params.organizationId);
            this.routeTo(org.canAccessImportExport ? 'import' : 'exposed-passwords-report');
        });
    }

    routeTo(page: string) {
        this.router.navigate([page], { relativeTo: this.route });
    }
}