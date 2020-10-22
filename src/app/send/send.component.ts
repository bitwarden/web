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

import { ToasterService } from 'angular2-toaster';

import { SendType } from 'jslib/enums/sendType';

import { SendView } from 'jslib/models/view/sendView';

import { AddEditComponent } from './add-edit.component';

import { ModalComponent } from '../modal.component';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { SendData } from 'jslib/models/data/sendData';

import { Send } from 'jslib/models/domain/send';

const BroadcasterSubscriptionId = 'SendComponent';

@Component({
    selector: 'app-send',
    templateUrl: 'send.component.html',
})
export class SendComponent implements OnInit, OnDestroy {
    @ViewChild('sendAddEdit', { read: ViewContainerRef, static: true }) sendAddEditModalRef: ViewContainerRef;

    sendType = SendType;
    loading = true;
    expired: boolean = false;
    type: SendType = null;
    sends: SendView[] = [];

    modal: ModalComponent = null;
    actionPromise: any;

    constructor(private syncService: SyncService, private route: ActivatedRoute,
        private router: Router, private changeDetectorRef: ChangeDetectorRef,
        private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver,
        private tokenService: TokenService, private cryptoService: CryptoService,
        private messagingService: MessagingService, private userService: UserService,
        private platformUtilsService: PlatformUtilsService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone, private apiService: ApiService,
        private toasterService: ToasterService) { }

    async ngOnInit() {
        const queryParamsSub = this.route.queryParams.subscribe(async (params) => {
            this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
                this.ngZone.run(async () => {
                    // TODO
                });
            });

            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }

            await this.load();
        });
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.loading = true;
        const userId = await this.userService.getUserId();
        const sends = await this.apiService.getSends();
        const sendsArr: SendView[] = [];
        if (sends != null && sends.data != null) {
            for (const res of sends.data) {
                const data = new SendData(res, userId);
                const send = new Send(data);
                const view = await send.decrypt();
                sendsArr.push(view);
            }
        }
        this.sends = sendsArr;
        this.loading = false;
    }

    addSend() {
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

    async removePassword(s: SendView): Promise<boolean> {
        if (this.actionPromise != null || s.password == null) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog('Are you sure you want to remove the password?',
            this.i18nService.t('permanentlyDeleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.putSendRemovePassword(s.id);
            await this.actionPromise;
            this.toasterService.popAsync('success', null, 'Removed password.');
            await this.load();
        } catch { }
        this.actionPromise = null;
    }

    async delete(s: SendView): Promise<boolean> {
        if (this.actionPromise != null) {
            return;
        }
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('permanentlyDeleteItemConfirmation'),
            this.i18nService.t('permanentlyDeleteItem'),
            this.i18nService.t('yes'), this.i18nService.t('no'), 'warning');
        if (!confirmed) {
            return false;
        }

        try {
            this.actionPromise = this.apiService.deleteSend(s.id);
            await this.actionPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('permanentlyDeletedItem'));
            await this.load();
        } catch { }
        this.actionPromise = null;
    }
}
