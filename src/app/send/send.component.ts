import {
    Component,
    ComponentFactoryResolver,
    NgZone,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';

import { SendView } from 'jslib/models/view/sendView';

import { AddEditComponent } from './add-edit.component';
import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { ModalComponent } from '../modal.component';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SendService } from 'jslib/abstractions/send.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SearchService, UserService } from 'jslib/abstractions';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent extends BaseSendComponent {
    @ViewChild('sendAddEdit', { read: ViewContainerRef, static: true }) sendAddEditModalRef: ViewContainerRef;

    modal: ModalComponent = null;

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService,
        broadcasterService: BroadcasterService, ngZone: NgZone, searchService: SearchService, policyService: PolicyService, userService: UserService,
        private componentFactoryResolver: ComponentFactoryResolver) {
        super(sendService, i18nService, platformUtilsService, environmentService, broadcasterService, ngZone,
            searchService, policyService, userService);
    }

    addSend() {
        if (this.disableSend) {
            return;
        }

        const component = this.editSend(null);
        component.type = this.type;
    }

    editSend(send: SendView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.sendAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AddEditComponent>(
            AddEditComponent, this.sendAddEditModalRef);

        childComponent.sendId = send == null ? null : send.id;
        childComponent.onSavedSend.subscribe(async (s: SendView) => {
            this.modal.close();
            await this.load();
        });
        childComponent.onDeletedSend.subscribe(async (s: SendView) => {
            this.modal.close();
            await this.load();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });

        return childComponent;
    }
}
