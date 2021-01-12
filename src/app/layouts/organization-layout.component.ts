import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';

const BroadcasterSubscriptionId = 'OrganizationLayoutComponent';

@Component({
    selector: 'app-organization-layout',
    templateUrl: 'organization-layout.component.html',
})
export class OrganizationLayoutComponent implements OnInit, OnDestroy {
    organization: Organization;
    businessTokenPromise: Promise<any>;
    private organizationId: string;
    private businessUrl: string;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private apiService: ApiService, private platformUtilsService: PlatformUtilsService,
        private environmentService: EnvironmentService) { }

    ngOnInit() {
        this.businessUrl = 'https://portal.bitwarden.com';
        if (this.environmentService.enterpriseUrl != null) {
            this.businessUrl = this.environmentService.enterpriseUrl;
        } else if (this.environmentService.baseUrl != null) {
            this.businessUrl = this.environmentService.baseUrl + '/portal';
        }

        document.body.classList.remove('layout_frontend');
        this.route.params.subscribe(async (params) => {
            this.organizationId = params.organizationId;
            await this.load();
        });
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'updatedOrgLicense':
                        await this.load();
                        break;
                }
            });
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.organization = await this.userService.getOrganization(this.organizationId);
    }

    async goToBusinessPortal() {
        if (this.businessTokenPromise != null) {
            return;
        }
        try {
            this.businessTokenPromise = this.apiService.getEnterprisePortalSignInToken();
            const token = await this.businessTokenPromise;
            if (token != null) {
                const userId = await this.userService.getUserId();
                this.platformUtilsService.launchUri(this.businessUrl + '/login?userId=' + userId +
                    '&token=' + (window as any).encodeURIComponent(token) + '&organizationId=' + this.organization.id);
            }
        } catch { }
        this.businessTokenPromise = null;
    }

    get showMenuBar() {
        return this.showManageTab || this.showToolsTab || this.organization.isOwner;
    }

    get showManageTab(): boolean {
        return this.organization.canManageUsers ||
            this.organization.canManageAssignedCollections ||
            this.organization.canManageAllCollections ||
            this.organization.canManageGroups ||
            this.organization.canManagePolicies ||
            this.organization.canAccessEventLogs;
    }

    get showToolsTab(): boolean {
        return this.organization.canAccessImportExport || this.organization.canAccessReports;
    }

    get showBusinessPortalButton(): boolean {
        return this.organization.useBusinessPortal && this.organization.canAccessBusinessPortal;
    }

    get toolsRoute(): string {
        return this.organization.canAccessImportExport ?
            'tools/import' :
            'tools/exposed-passwords-report';
    }

    get manageRoute(): string {
        let route: string;
        switch (true) {
            case this.organization.canManageUsers:
                route = 'manage/people';
                break;
            case this.organization.canManageAssignedCollections || this.organization.canManageAllCollections:
                route = 'manage/collections';
                break;
            case this.organization.canManageGroups:
                route = 'manage/groups';
                break;
            case this.organization.canManagePolicies:
                route = 'manage/policies';
                break;
            case this.organization.canAccessEventLogs:
                route = 'manage/events';
                break;
        }
        return route;
    }
}
