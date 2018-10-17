import { Location } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { Organization } from 'jslib/models/domain/organization';
import { CipherView } from 'jslib/models/view/cipherView';

import { CipherType } from 'jslib/enums/cipherType';

import { ModalComponent } from '../../modal.component';

import { EntityEventsComponent } from '../manage/entity-events.component';
import { AddEditComponent } from './add-edit.component';
import { AttachmentsComponent } from './attachments.component';
import { CiphersComponent } from './ciphers.component';
import { CollectionsComponent } from './collections.component';
import { GroupingsComponent } from './groupings.component';

const BroadcasterSubscriptionId = 'OrgVaultComponent';

@Component({
    selector: 'app-org-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit, OnDestroy {
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;
    @ViewChild('attachments', { read: ViewContainerRef }) attachmentsModalRef: ViewContainerRef;
    @ViewChild('cipherAddEdit', { read: ViewContainerRef }) cipherAddEditModalRef: ViewContainerRef;
    @ViewChild('collections', { read: ViewContainerRef }) collectionsModalRef: ViewContainerRef;
    @ViewChild('eventsTemplate', { read: ViewContainerRef }) eventsModalRef: ViewContainerRef;

    organization: Organization;
    collectionId: string;
    type: CipherType;
    showAdd = true;

    private modal: ModalComponent = null;

    constructor(private route: ActivatedRoute, private userService: UserService,
        private location: Location, private router: Router,
        private syncService: SyncService, private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver, private messagingService: MessagingService,
        private broadcasterService: BroadcasterService, private ngZone: NgZone,
        private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.route.parent.params.subscribe(async (params) => {
            this.organization = await this.userService.getOrganization(params.organizationId);
            this.showAdd = this.organization.isAdmin;
            this.groupingsComponent.organization = this.organization;
            this.ciphersComponent.organization = this.organization;

            this.route.queryParams.subscribe(async (qParams) => {
                this.ciphersComponent.searchText = this.groupingsComponent.searchText = qParams.search;
                if (!this.organization.isAdmin) {
                    await this.syncService.fullSync(false);
                    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
                        this.ngZone.run(async () => {
                            switch (message.command) {
                                case 'syncCompleted':
                                    if (message.successfully) {
                                        await Promise.all([
                                            this.groupingsComponent.load(),
                                            this.ciphersComponent.refresh(),
                                        ]);
                                        this.changeDetectorRef.detectChanges();
                                    }
                                    break;
                            }
                        });
                    });
                }
                await this.groupingsComponent.load();

                if (qParams == null) {
                    this.groupingsComponent.selectedAll = true;
                    await this.ciphersComponent.load();
                } else {
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
                }

                if (qParams.viewEvents != null) {
                    const cipher = this.ciphersComponent.ciphers.filter((c) => c.id === qParams.viewEvents);
                    if (cipher.length > 0) {
                        this.viewEvents(cipher[0]);
                    }
                }
            });
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async clearGroupingFilters() {
        this.ciphersComponent.showAddNew = this.showAdd;
        this.groupingsComponent.searchPlaceholder = this.i18nService.t('searchVault');
        await this.ciphersComponent.applyFilter();
        this.clearFilters();
        this.go();
    }

    async filterCipherType(type: CipherType, load = false) {
        this.ciphersComponent.showAddNew = this.showAdd;
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
                return c.collectionIds != null && c.collectionIds.indexOf(collectionId) > -1;
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
        this.ciphersComponent.search(200);
    }

    editCipherAttachments(cipher: CipherView) {
        if (this.organization.maxStorageGb == null || this.organization.maxStorageGb === 0) {
            this.messagingService.send('upgradeOrganization', { organizationId: cipher.organizationId });
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.attachmentsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AttachmentsComponent>(AttachmentsComponent, this.attachmentsModalRef);

        childComponent.organization = this.organization;
        childComponent.cipherId = cipher.id;
        let madeAttachmentChanges = false;
        childComponent.onUploadedAttachment.subscribe(() => madeAttachmentChanges = true);
        childComponent.onDeletedAttachment.subscribe(() => madeAttachmentChanges = true);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
            if (madeAttachmentChanges) {
                await this.ciphersComponent.refresh();
            }
            madeAttachmentChanges = false;
        });
    }

    editCipherCollections(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.collectionsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<CollectionsComponent>(CollectionsComponent, this.collectionsModalRef);

        if (this.organization.isAdmin) {
            childComponent.collectionIds = cipher.collectionIds;
            childComponent.collections = this.groupingsComponent.collections.filter((c) => !c.readOnly);
        }
        childComponent.organization = this.organization;
        childComponent.cipherId = cipher.id;
        childComponent.onSavedCollections.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
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

    async viewEvents(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.eventsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<EntityEventsComponent>(
            EntityEventsComponent, this.eventsModalRef);

        childComponent.name = cipher.name;
        childComponent.organizationId = this.organization.id;
        childComponent.entityId = cipher.id;
        childComponent.showUser = true;
        childComponent.entity = 'cipher';

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
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
