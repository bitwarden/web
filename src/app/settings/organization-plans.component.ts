import {
    Component,
    EventEmitter,
    Input,
    OnInit,
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
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { PaymentComponent } from './payment.component';
import { TaxInfoComponent } from './tax-info.component';

import { PlanType } from 'jslib/enums/planType';
import { PolicyType } from 'jslib/enums/policyType';
import { ProductType } from 'jslib/enums/productType';

import { OrganizationCreateRequest } from 'jslib/models/request/organizationCreateRequest';
import { OrganizationUpgradeRequest } from 'jslib/models/request/organizationUpgradeRequest';
import { PlanResponse } from 'jslib/models/response/planResponse';

@Component({
    selector: 'app-organization-plans',
    templateUrl: 'organization-plans.component.html',
})
export class OrganizationPlansComponent implements OnInit {
    @ViewChild(PaymentComponent) paymentComponent: PaymentComponent;
    @ViewChild(TaxInfoComponent) taxComponent: TaxInfoComponent;

    @Input() organizationId: string;
    @Input() showFree = true;
    @Input() showCancel = false;
    @Input() product: ProductType = ProductType.Free;
    @Input() plan: PlanType = PlanType.Free;
    @Output() onSuccess = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    loading: boolean = true;
    selfHosted: boolean = false;
    ownedBusiness: boolean = false;
    premiumAccessAddon: boolean = false;
    additionalStorage: number = 0;
    additionalSeats: number = 0;
    name: string;
    billingEmail: string;
    businessName: string;
    productTypes = ProductType;
    formPromise: Promise<any>;
    singleOrgPolicyBlock: boolean = false;

    plans: PlanResponse[];

    constructor(private apiService: ApiService, private i18nService: I18nService,
        private analytics: Angulartics2, private toasterService: ToasterService,
        platformUtilsService: PlatformUtilsService, private cryptoService: CryptoService,
        private router: Router, private syncService: SyncService,
        private policyService: PolicyService) {
        this.selfHosted = platformUtilsService.isSelfHost();
    }

    async ngOnInit() {
        if (!this.selfHosted) {
            const plans = await this.apiService.getPlans();
            this.plans = plans.data;
            if (this.product === ProductType.Enterprise || this.product === ProductType.Teams) {
                this.ownedBusiness = true;
            }
        }
        this.loading = false;
    }

    get createOrganization() {
        return this.organizationId == null;
    }

    get selectedPlan() {
        return this.plans.find((plan) => plan.type === this.plan);
    }

    get selectedPlanInterval() {
        return this.selectedPlan.isAnnual
            ? 'year'
            : 'month';
    }

    get selectableProducts() {
        let validPlans = this.plans.filter((plan) => plan.type !== PlanType.Custom);

        if (this.ownedBusiness) {
            validPlans = validPlans.filter((plan) => plan.canBeUsedByBusiness);
        }

        if (!this.showFree) {
            validPlans = validPlans.filter((plan) => plan.product !== ProductType.Free);
        }

        validPlans = validPlans
            .filter((plan) => !plan.legacyYear
                && !plan.disabled
                && (plan.isAnnual || plan.product === this.productTypes.Free));

        return validPlans;
    }

    get selectablePlans() {
        return this.plans.filter((plan) => !plan.legacyYear && !plan.disabled && plan.product === this.product);
    }

    additionalStoragePriceMonthly(selectedPlan: PlanResponse) {
        if (!selectedPlan.isAnnual) {
            return selectedPlan.additionalStoragePricePerGb;
        }
        return selectedPlan.additionalStoragePricePerGb / 12;
    }

    seatPriceMonthly(selectedPlan: PlanResponse) {
        if (!selectedPlan.isAnnual) {
            return selectedPlan.seatPrice;
        }
        return selectedPlan.seatPrice / 12;
    }

    additionalStorageTotal(plan: PlanResponse): number {
        if (!plan.hasAdditionalStorageOption) {
            return 0;
        }

        return plan.additionalStoragePricePerGb * Math.abs(this.additionalStorage || 0);
    }

    seatTotal(plan: PlanResponse): number {
        if (!plan.hasAdditionalSeatsOption) {
            return 0;
        }

        return plan.seatPrice * Math.abs(this.additionalSeats || 0);
    }

    get subtotal() {
        let subTotal = this.selectedPlan.basePrice;
        if (this.selectedPlan.hasAdditionalSeatsOption && this.additionalSeats) {
            subTotal += this.seatTotal(this.selectedPlan);
        }
        if (this.selectedPlan.hasAdditionalStorageOption && this.additionalStorage) {
            subTotal += this.additionalStorageTotal(this.selectedPlan);
        }
        if (this.selectedPlan.hasPremiumAccessOption && this.premiumAccessAddon) {
            subTotal += this.selectedPlan.premiumAccessOptionPrice;
        }
        return subTotal;
    }

    get taxCharges() {
        return this.taxComponent != null && this.taxComponent.taxRate != null ?
            (this.taxComponent.taxRate / 100) * this.subtotal :
            0;
    }

    get total() {
        return (this.subtotal + this.taxCharges) || 0;
    }

    changedProduct() {
        this.plan = this.selectablePlans[0].type;
        if (!this.selectedPlan.hasPremiumAccessOption) {
            this.premiumAccessAddon = false;
        }
        if (!this.selectedPlan.hasAdditionalStorageOption) {
            this.additionalStorage = 0;
        }
        if (!this.selectedPlan.hasAdditionalSeatsOption) {
            this.additionalSeats = 0;
        } else if (!this.additionalSeats && !this.selectedPlan.baseSeats &&
            this.selectedPlan.hasAdditionalSeatsOption) {
            this.additionalSeats = 1;
        }
    }

    changedOwnedBusiness() {
        if (!this.ownedBusiness || this.selectedPlan.canBeUsedByBusiness) {
            return;
        }
        this.product = ProductType.Teams;
        this.plan = PlanType.TeamsAnnually;
    }

    changedCountry() {
        this.paymentComponent.hideBank = this.taxComponent.taxInfo.country !== 'US';
        // Bank Account payments are only available for US customers
        if (this.paymentComponent.hideBank &&
            this.paymentComponent.method === PaymentMethodType.BankAccount) {
            this.paymentComponent.method = PaymentMethodType.Card;
            this.paymentComponent.changeMethod();
        }
    }

    cancel() {
        this.onCanceled.emit();
    }

    async submit() {
        if (this.singleOrgPolicyBlock) {
            return;
        } else {
            const policies = await this.policyService.getAll(PolicyType.SingleOrg);
            this.singleOrgPolicyBlock = policies.some(policy => policy.enabled);
            if (this.singleOrgPolicyBlock) {
                return;
            }
        }

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
            const doSubmit = async () => {
                let orgId: string = null;
                if (this.createOrganization) {
                    let tokenResult: [string, PaymentMethodType] = null;
                    if (!this.selfHosted && this.plan !== PlanType.Free) {
                        tokenResult = await this.paymentComponent.createPaymentToken();
                    }
                    const shareKey = await this.cryptoService.makeShareKey();
                    const key = shareKey[0].encryptedString;
                    const collection = await this.cryptoService.encrypt(
                        this.i18nService.t('defaultCollection'), shareKey[1]);
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

                        if (this.selectedPlan.type === PlanType.Free) {
                            request.planType = PlanType.Free;
                        } else {
                            request.paymentToken = tokenResult[0];
                            request.paymentMethodType = tokenResult[1];
                            request.businessName = this.ownedBusiness ? this.businessName : null;
                            request.additionalSeats = this.additionalSeats;
                            request.additionalStorageGb = this.additionalStorage;
                            request.premiumAccessAddon = this.selectedPlan.hasPremiumAccessOption &&
                                this.premiumAccessAddon;
                            request.planType = this.selectedPlan.type;
                            request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;
                            request.billingAddressCountry = this.taxComponent.taxInfo.country;
                            if (this.taxComponent.taxInfo.includeTaxId) {
                                request.taxIdNumber = this.taxComponent.taxInfo.taxId;
                                request.billingAddressLine1 = this.taxComponent.taxInfo.line1;
                                request.billingAddressLine2 = this.taxComponent.taxInfo.line2;
                                request.billingAddressCity = this.taxComponent.taxInfo.city;
                                request.billingAddressState = this.taxComponent.taxInfo.state;
                            }
                        }
                        const response = await this.apiService.postOrganization(request);
                        orgId = response.id;
                    }
                } else {
                    const request = new OrganizationUpgradeRequest();
                    request.businessName = this.ownedBusiness ? this.businessName : null;
                    request.additionalSeats = this.additionalSeats;
                    request.additionalStorageGb = this.additionalStorage;
                    request.premiumAccessAddon = this.selectedPlan.hasPremiumAccessOption &&
                        this.premiumAccessAddon;
                    request.planType = this.selectedPlan.type;
                    request.billingAddressCountry = this.taxComponent.taxInfo.country;
                    request.billingAddressPostalCode = this.taxComponent.taxInfo.postalCode;

                    const result = await this.apiService.postOrganizationUpgrade(this.organizationId, request);
                    if (!result.success && result.paymentIntentClientSecret != null) {
                        await this.paymentComponent.handleStripeCardPayment(result.paymentIntentClientSecret, null);
                    }
                    orgId = this.organizationId;
                }

                if (orgId != null) {
                    await this.apiService.refreshIdentityToken();
                    await this.syncService.fullSync(true);
                    if (this.createOrganization) {
                        this.analytics.eventTrack.next({ action: 'Created Organization' });
                        this.toasterService.popAsync('success',
                            this.i18nService.t('organizationCreated'), this.i18nService.t('organizationReadyToGo'));
                    } else {
                        this.analytics.eventTrack.next({ action: 'Upgraded Organization' });
                        this.toasterService.popAsync('success', null, this.i18nService.t('organizationUpgraded'));
                    }
                    this.router.navigate(['/organizations/' + orgId]);
                }
            };

            this.formPromise = doSubmit();
            await this.formPromise;
            this.onSuccess.emit();
        } catch { }
    }

}
