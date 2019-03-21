import {
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { PaymentMethodType } from 'jslib/enums/paymentMethodType';

import { ApiService } from 'jslib/abstractions/api.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { PaymentComponent } from './payment.component';

import { PlanType } from 'jslib/enums/planType';
import { OrganizationCreateRequest } from 'jslib/models/request/organizationCreateRequest';

@Component({
    selector: 'app-organization-plans',
    templateUrl: 'organization-plans.component.html',
})
export class OrganizationPlansComponent {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;

    @Input() organizationId: string;
    @Input() showFree = true;
    @Input() showCancel = false;
    @Input() plan = 'free';
    @Output() onSuccess = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    selfHosted = false;
    ownedBusiness = false;
    premiumAccessAddon = false;
    storageGbPriceMonthly = 0.33;
    additionalStorage = 0;
    additionalSeats = 0;
    interval = 'year';
    name: string;
    billingEmail: string;
    businessName: string;

    storageGb: any = {
        price: 0.33,
        monthlyPrice: 0.50,
        yearlyPrice: 4,
    };

    plans: any = {
        free: {
            basePrice: 0,
            noAdditionalSeats: true,
            noPayment: true,
        },
        families: {
            basePrice: 1,
            annualBasePrice: 12,
            baseSeats: 5,
            noAdditionalSeats: true,
            annualPlanType: PlanType.FamiliesAnnually,
            canBuyPremiumAccessAddon: true,
        },
        teams: {
            basePrice: 5,
            annualBasePrice: 60,
            monthlyBasePrice: 8,
            baseSeats: 5,
            seatPrice: 2,
            annualSeatPrice: 24,
            monthlySeatPrice: 2.5,
            monthPlanType: PlanType.TeamsMonthly,
            annualPlanType: PlanType.TeamsAnnually,
        },
        enterprise: {
            seatPrice: 3,
            annualSeatPrice: 36,
            monthlySeatPrice: 4,
            monthPlanType: PlanType.EnterpriseMonthly,
            annualPlanType: PlanType.EnterpriseAnnually,
        },
    };

    formPromise: Promise<any>;

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService, private cryptoService: CryptoService,
        private router: Router, private syncService: SyncService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async submit() {
        let files: FileList = null;
        if (this.createOrganization && this.selfHosted) {
            const fileEl = document.getElementById('file') as HTMLInputElement;
            files = fileEl.files;
            if (files == null || files.length === 0) {
                this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                    this.i18nService.t('selectFile'));
                return;
            }
        }

        try {
            this.formPromise = this.doSubmit(files);
            await this.formPromise;
            this.onSuccess.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }

    changedPlan() {
        if (!this.plans[this.plan].canBuyPremiumAccessAddon) {
            this.premiumAccessAddon = false;
        }

        if (this.plans[this.plan].monthPlanType == null) {
            this.interval = 'year';
        }

        if (this.plans[this.plan].noAdditionalSeats) {
            this.additionalSeats = 0;
        } else if (!this.additionalSeats && !this.plans[this.plan].baseSeats &&
            !this.plans[this.plan].noAdditionalSeats) {
            this.additionalSeats = 1;
        }
    }

    changedOwnedBusiness() {
        if (!this.ownedBusiness || this.plan === 'teams' || this.plan === 'enterprise') {
            return;
        }
        this.plan = 'teams';
    }

    additionalStorageTotal(annual: boolean): number {
        if (annual) {
            return Math.abs(this.additionalStorage || 0) * this.storageGb.yearlyPrice;
        } else {
            return Math.abs(this.additionalStorage || 0) * this.storageGb.monthlyPrice;
        }
    }

    seatTotal(annual: boolean): number {
        if (this.plans[this.plan].noAdditionalSeats) {
            return 0;
        }

        if (annual) {
            return this.plans[this.plan].annualSeatPrice * Math.abs(this.additionalSeats || 0);
        } else {
            return this.plans[this.plan].monthlySeatPrice * Math.abs(this.additionalSeats || 0);
        }
    }

    baseTotal(annual: boolean): number {
        if (annual) {
            return Math.abs(this.plans[this.plan].annualBasePrice || 0);
        } else {
            return Math.abs(this.plans[this.plan].monthlyBasePrice || 0);
        }
    }

    premiumAccessTotal(annual: boolean): number {
        if (this.plans[this.plan].canBuyPremiumAccessAddon && this.premiumAccessAddon) {
            if (annual) {
                return 40;
            }
        }
        return 0;
    }

    get total(): number {
        const annual = this.interval === 'year';
        return this.baseTotal(annual) + this.seatTotal(annual) + this.additionalStorageTotal(annual) +
            this.premiumAccessTotal(annual);
    }

    get createOrganization() {
        return this.organizationId == null;
    }

    private async doSubmit(files: FileList) {
        let tokenResult: [string, PaymentMethodType] = null;
        if (!this.selfHosted && this.plan !== 'free') {
            tokenResult = await this.paymentComponent.createPaymentToken();
        }

        let orgId: string = null;
        if (this.createOrganization) {
            const shareKey = await this.cryptoService.makeShareKey();
            const key = shareKey[0].encryptedString;
            const collection = await this.cryptoService.encrypt(this.i18nService.t('defaultCollection'), shareKey[1]);
            const collectionCt = collection.encryptedString;

            if (this.selfHosted) {
                const fd = new FormData();
                fd.append('license', files[0]);
                fd.append('key', key);
                fd.append('collectionName', collectionCt);
                const response = await this.apiService.postOrganizationLicense(fd);
                orgId = response.id;
            } else {
                const request = new OrganizationCreateRequest();
                request.key = key;
                request.collectionName = collectionCt;
                request.name = this.name;
                request.billingEmail = this.billingEmail;

                if (this.plan === 'free') {
                    request.planType = PlanType.Free;
                } else {
                    request.paymentToken = tokenResult[0];
                    request.paymentMethodType = tokenResult[1];
                    request.businessName = this.ownedBusiness ? this.businessName : null;
                    request.additionalSeats = this.additionalSeats;
                    request.additionalStorageGb = this.additionalStorage;
                    request.premiumAccessAddon = this.plans[this.plan].canBuyPremiumAccessAddon &&
                        this.premiumAccessAddon;
                    if (this.interval === 'month') {
                        request.planType = this.plans[this.plan].monthPlanType;
                    } else {
                        request.planType = this.plans[this.plan].annualPlanType;
                    }
                }
                const response = await this.apiService.postOrganization(request);
                orgId = response.id;
            }
        } else {
            // TODO
            orgId = this.organizationId;
        }

        if (orgId != null) {
            await this.apiService.refreshIdentityToken();
            await this.syncService.fullSync(true);
            this.analytics.eventTrack.next({
                action: (this.createOrganization ? 'Created' : 'Upgraded') + ' Organization',
            });
            this.toasterService.popAsync('success',
                this.i18nService.t(this.createOrganization ? 'organizationCreated' : ''), // TODO
                this.i18nService.t('organizationReadyToGo'));
            this.router.navigate(['/organizations/' + orgId]);
        }
    }
}
