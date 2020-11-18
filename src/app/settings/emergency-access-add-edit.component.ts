import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { EmergencyAccessType } from 'jslib/enums/emergencyAccessType';
import { EmergencyAccessInviteRequest } from 'jslib/models/request/emergencyAccessInviteRequest';
import { EmergencyAccessUpdateRequest } from 'jslib/models/request/emergencyAccessUpdateRequest';

@Component({
    selector: 'emergency-access-add-edit',
    templateUrl: 'emergency-access-add-edit.component.html',
})
export class EmergencyAccessAddEditComponent implements OnInit {
    @Input() name: string;
    @Input() emergencyAccessId: string;
    @Output() onSavedUser = new EventEmitter();
    @Output() onDeletedUser = new EventEmitter();

    loading = true;
    editMode: boolean = false;
    title: string;
    email: string;
    type: EmergencyAccessType = EmergencyAccessType.View;

    formPromise: Promise<any>;
    deletePromise: Promise<any>;

    emergencyAccessType = EmergencyAccessType;
    waitTimes: { name: string; value: number; }[];
    waitTime: number;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private toasterService: ToasterService, private platformUtilsService: PlatformUtilsService) { }

    async ngOnInit() {
        this.editMode = this.loading = this.emergencyAccessId != null;

        this.waitTimes = [
            { name: this.i18nService.t('oneDay'), value: 1 },
            { name: this.i18nService.t('days', '2'), value: 2 },
            { name: this.i18nService.t('days', '7'), value: 7 },
            { name: this.i18nService.t('days', '14'), value: 14 },
            { name: this.i18nService.t('days', '30'), value: 30 },
            { name: this.i18nService.t('days', '90'), value: 90 },
        ];

        if (this.editMode) {
            this.editMode = true;
            this.title = this.i18nService.t('editEmergencyContact');
            try {
                const user = await this.apiService.getEmergencyAccess(this.emergencyAccessId);
                this.type = user.type;
                this.waitTime = user.waitTimeDays;
            } catch { }
        } else {
            this.title = this.i18nService.t('inviteEmergencyContact');
            this.waitTime = this.waitTimes[2].value;
        }

        this.loading = false;
    }

    async submit() {
        try {
            if (this.editMode) {
                const request = new EmergencyAccessUpdateRequest();
                request.type = this.type;
                request.waitTimeDays = this.waitTime;

                this.formPromise = this.apiService.putEmergencyAccess(this.emergencyAccessId, request);
            } else {
                const request = new EmergencyAccessInviteRequest();
                request.email = this.email.trim();
                request.type = this.type;
                request.waitTimeDays = this.waitTime;

                this.formPromise = this.apiService.postEmergencyAccessInvite(request);
            }

            await this.formPromise;
            this.toasterService.popAsync('success', null,
                this.i18nService.t(this.editMode ? 'editedUserId' : 'invitedUsers', this.name));
            this.onSavedUser.emit();
        } catch { }
    }

    async delete() {
        this.onDeletedUser.emit();
    }
}
