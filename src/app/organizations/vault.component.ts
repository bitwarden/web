import { Location } from '@angular/common';
import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { Organization } from 'jslib/models/domain/organization';
import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { CiphersComponent } from './ciphers.component';
import { GroupingsComponent } from './groupings.component';

@Component({
    selector: 'app-org-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit {
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;

    organization: Organization;
    collectionId: string;
    type: CipherType;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private location: Location, private router: Router,
        private syncService: SyncService, private i18nService: I18nService) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.groupingsComponent.organization = this.organization;
            this.ciphersComponent.organization = this.organization;

            this.route.queryParams.subscribe(async (qParams) => {
                if (!this.organization.isAdmin) {
                    await this.syncService.fullSync(false);
                }
                await this.groupingsComponent.load();

                if (qParams == null) {
                    this.groupingsComponent.selectedAll = true;
                    await this.ciphersComponent.load();
                    return;
                }

                if (qParams.type) {
                    const t = parseInt(qParams.type, null);
                    this.groupingsComponent.selectedType = t;
                    await this.filterCipherType(t, true);
                } else if (qParams.collectionId) {
                    this.groupingsComponent.selectedCollectionId = qParams.collectionId;
                    await this.filterCollection(qParams.collectionId, true);
                } else {
                    this.groupingsComponent.selectedAll = true;
                    await this.ciphersComponent.load();
                }
            });
        });
    }

    async clearGroupingFilters() {
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchVault');
        await this.ciphersComponent.applyFilter();
        this.clearFilters();
        this.go();
    }

    async filterCipherType(type: CipherType, load = false) {
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchType');
        const filter = (c: CipherView) => c.type === type;
        if (load) {
            await this.ciphersComponent.load(filter);
        } else {
            await this.ciphersComponent.applyFilter(filter);
        }
        this.clearFilters();
        this.type = type;
        this.go();
    }

    async filterCollection(collectionId: string, load = false) {
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchCollection');
        const filter = (c: CipherView) => c.collectionIds.indexOf(collectionId) > -1;
        if (load) {
            await this.ciphersComponent.load(filter);
        } else {
            await this.ciphersComponent.applyFilter(filter);
        }
        this.clearFilters();
        this.collectionId = collectionId;
        this.go();
    }

    filterSearchText(searchText: string) {
        this.ciphersComponent.searchText = searchText;
    }

    private clearFilters() {
        this.collectionId = null;
        this.type = null;
    }

    private go(queryParams: any = null) {
        if (queryParams == null) {
            queryParams = {
                type: this.type,
                collectionId: this.collectionId,
            };
        }

        const url = this.router.createUrlTree(['organizations', this.organization.id, 'vault'],
            { queryParams: queryParams }).toString();
        this.location.go(url);
    }
}
