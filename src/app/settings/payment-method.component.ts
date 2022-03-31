import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PaymentMethodType } from "jslib-common/enums/paymentMethodType";
import { BillingPaymentResponse } from "jslib-common/models/response/billingPaymentResponse";

@Component({
  selector: "app-payment-method",
  templateUrl: "payment-method.component.html",
})
export class PaymentMethodComponent implements OnInit {
  loading = false;
  firstLoaded = false;
  showAdjustPayment = false;
  showAddCredit = false;
  billing: BillingPaymentResponse;
  paymentMethodType = PaymentMethodType;

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.platformUtilsService.isSelfHost()) {
      this.router.navigate(["/settings/subscription"]);
    }
    await this.load();
    this.firstLoaded = true;
  }

  async load() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.billing = await this.apiService.getUserBillingPayment();
    this.loading = false;
  }

  addCredit() {
    if (this.paymentSourceInApp) {
      this.platformUtilsService.showDialog(
        this.i18nService.t("cannotPerformInAppPurchase"),
        this.i18nService.t("addCredit"),
        null,
        null,
        "warning"
      );
      return;
    }
    this.showAddCredit = true;
  }

  closeAddCredit(load: boolean) {
    this.showAddCredit = false;
    if (load) {
      this.load();
    }
  }

  changePayment() {
    if (this.paymentSourceInApp) {
      this.platformUtilsService.showDialog(
        this.i18nService.t("cannotPerformInAppPurchase"),
        this.i18nService.t("changePaymentMethod"),
        null,
        null,
        "warning"
      );
      return;
    }
    this.showAdjustPayment = true;
  }

  closePayment(load: boolean) {
    this.showAdjustPayment = false;
    if (load) {
      this.load();
    }
  }

  get isCreditBalance() {
    return this.billing == null || this.billing.balance <= 0;
  }

  get creditOrBalance() {
    return Math.abs(this.billing != null ? this.billing.balance : 0);
  }

  get paymentSource() {
    return this.billing != null ? this.billing.paymentSource : null;
  }

  get paymentSourceInApp() {
    return (
      this.paymentSource != null &&
      (this.paymentSource.type === PaymentMethodType.AppleInApp ||
        this.paymentSource.type === PaymentMethodType.GoogleInApp)
    );
  }
}
