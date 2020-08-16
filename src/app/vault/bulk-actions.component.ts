import {
    Component,
    ComponentFactoryResolver,
    Input,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { ToasterService } from 'angular2-toaster';

import { I18nService } from 'jslib/abstractions/i18n.service';

import { Organization } from 'jslib/models/domain/organization';

import { ModalComponent } from '../modal.component';

import { BulkDeleteComponent } from './bulk-delete.component';
import { BulkMoveComponent } from './bulk-move.component';
import { BulkRestoreComponent } from './bulk-restore.component';
import { BulkShareComponent } from './bulk-share.component';
import { CiphersComponent } from './ciphers.component';

@Component({
    selector: 'app-vault-bulk-actions',
    templateUrl: 'bulk-actions.component.html',
})
export class BulkActionsComponent {
    @Input() ciphersComponent: CiphersComponent;
    @Input() modal: ModalComponent;
    @Input() deleted: boolean;
    @Input() organization: Organization;

    @ViewChild('bulkDeleteTemplate', { read: ViewContainerRef, static: true })
    bulkDeleteModalRef: ViewContainerRef;
    @ViewChild('bulkRestoreTemplate', { read: ViewContainerRef, static: true })
    bulkRestoreModalRef: ViewContainerRef;
    @ViewChild('bulkMoveTemplate', { read: ViewContainerRef, static: true })
    bulkMoveModalRef: ViewContainerRef;
    @ViewChild('bulkShareTemplate', { read: ViewContainerRef, static: true })
    bulkShareModalRef: ViewContainerRef;

    constructor(
        private toasterService: ToasterService,
        private i18nService: I18nService,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    bulkDelete() {
        const selectedIds = this.ciphersComponent.getSelectedIds();
        if (selectedIds.length === 0) {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('nothingSelected')
            );
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkDeleteModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<BulkDeleteComponent>(
            BulkDeleteComponent,
            this.bulkDeleteModalRef
        );

        childComponent.permanent = this.deleted;
        childComponent.cipherIds = selectedIds;
        childComponent.organization = this.organization;
        childComponent.onDeleted.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    bulkRestore() {
        const selectedIds = this.ciphersComponent.getSelectedIds();
        if (selectedIds.length === 0) {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('nothingSelected')
            );
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkRestoreModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<BulkRestoreComponent>(
            BulkRestoreComponent,
            this.bulkRestoreModalRef
        );

        childComponent.cipherIds = selectedIds;
        childComponent.onRestored.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    bulkShare() {
        const selectedCiphers = this.ciphersComponent.getSelected();
        if (selectedCiphers.length === 0) {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('nothingSelected')
            );
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkShareModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<BulkShareComponent>(
            BulkShareComponent,
            this.bulkShareModalRef
        );

        childComponent.ciphers = selectedCiphers;
        childComponent.onShared.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    bulkMove() {
        const selectedIds = this.ciphersComponent.getSelectedIds();
        if (selectedIds.length === 0) {
            this.toasterService.popAsync(
                'error',
                this.i18nService.t('errorOccurred'),
                this.i18nService.t('nothingSelected')
            );
            return;
        }

        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.bulkMoveModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<BulkMoveComponent>(
            BulkMoveComponent,
            this.bulkMoveModalRef
        );

        childComponent.cipherIds = selectedIds;
        childComponent.onMoved.subscribe(async () => {
            this.modal.close();
            await this.ciphersComponent.refresh();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    selectAll(select: boolean) {
        this.ciphersComponent.selectAll(select);
    }
}
