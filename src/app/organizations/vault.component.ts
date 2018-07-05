import { Location } from '@angular/common';
import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
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

import { ModalComponent } from '../modal.component';

import { AddEditComponent } from './add-edit.component';
import { CiphersComponent } from './ciphers.component';
import { GroupingsComponent } from './groupings.component';

@Component({
    selector: 'app-org-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit {
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;

    organization: Organization;
    collectionId: string;
    type: CipherType;

    private modal: ModalComponent = null;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private location: Location, private router: Router,
        private syncService: SyncService, private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver) { }

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
        this.ciphersComponent.showAddNew = true;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchVault');
        await this.ciphersComponent.applyFilter();
        this.clearFilters();
        this.go();
    }

    async filterCipherType(type: CipherType, load = false) {
        this.ciphersComponent.showAddNew = true;
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
        this.ciphersComponent.showAddNew = false;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchCollection');
        const filter = (c: CipherView) => {
            if (collectionId === 'unassigned') {
                return c.collectionIds == null || c.collectionIds.length === 0;
            } else {
                return c.collectionIds.indexOf(collectionId) > -1;
            }
        };
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

    addCipher() {
        const component = this.editCipher(null);
        component.type = this.type;
    }

    editCipher(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.cipherAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(AddEditComponent, this.cipherAddEditModalRef);

        childComponent.organization = this.organization;
        childComponent.cipherId = cipher == null ? null : cipher.id;
        childComponent.onSavedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });
        childComponent.onDeletedCipher.subscribe(async (c: CipherView) => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
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
