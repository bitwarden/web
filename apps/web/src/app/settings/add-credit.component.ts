import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { PayPalConfig } from "jslib-common/abstractions/environment.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { PaymentMethodType } from "jslib-common/enums/paymentMethodType";
import { BitPayInvoiceRequest } from "jslib-common/models/request/bitPayInvoiceRequest";

@Component({
  selector: "app-add-credit",
  templateUrl: "add-credit.component.html",
})
export class AddCreditComponent implements OnInit {
  @Input() creditAmount: string;
  @Input() showOptions = true;
  @Input() method = PaymentMethodType.PayPal;
  @Input() organizationId: string;
  @Output() onAdded = new EventEmitter();
  @Output() onCanceled = new EventEmitter();

  @ViewChild("ppButtonForm", { read: ElementRef, static: true }) ppButtonFormRef: ElementRef;

  paymentMethodType = PaymentMethodType;
  ppButtonFormAction: string;
  ppButtonBusinessId: string;
  ppButtonCustomField: string;
  ppLoading = false;
  subject: string;
  returnUrl: string;
  formPromise: Promise<any>;

  private userId: string;
  private name: string;
  private email: string;

  constructor(
    private stateService: StateService,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private organizationService: OrganizationService,
    private logService: LogService
  ) {
    const payPalConfig = process.env.PAYPAL_CONFIG as PayPalConfig;
    this.ppButtonFormAction = payPalConfig.buttonAction;
    this.ppButtonBusinessId = payPalConfig.businessId;
  }

  async ngOnInit() {
    if (this.organizationId != null) {
      if (this.creditAmount == null) {
        this.creditAmount = "20.00";
      }
      this.ppButtonCustomField = "organization_id:" + this.organizationId;
      const org = await this.organizationService.get(this.organizationId);
      if (org != null) {
        this.subject = org.name;
        this.name = org.name;
      }
    } else {
      if (this.creditAmount == null) {
        this.creditAmount = "10.00";
      }
      this.userId = await this.stateService.getUserId();
      this.subject = await this.stateService.getEmail();
      this.email = this.subject;
      this.ppButtonCustomField = "user_id:" + this.userId;
    }
    this.ppButtonCustomField += ",account_credit:1";
    this.returnUrl = window.location.href;
  }

  async submit() {
    if (this.creditAmount == null || this.creditAmount === "") {
      return;
    }

    if (this.method === PaymentMethodType.PayPal) {
      this.ppButtonFormRef.nativeElement.submit();
      this.ppLoading = true;
      return;
    }
    if (this.method === PaymentMethodType.BitPay) {
      try {
        const req = new BitPayInvoiceRequest();
        req.email = this.email;
        req.name = this.name;
        req.credit = true;
        req.amount = this.creditAmountNumber;
        req.organizationId = this.organizationId;
        req.userId = this.userId;
        req.returnUrl = this.returnUrl;
        this.formPromise = this.apiService.postBitPayInvoice(req);
        const bitPayUrl: string = await this.formPromise;
        this.platformUtilsService.launchUri(bitPayUrl);
      } catch (e) {
        this.logService.error(e);
      }
      return;
    }
    try {
      this.onAdded.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  cancel() {
    this.onCanceled.emit();
  }

  formatAmount() {
    try {
      if (this.creditAmount != null && this.creditAmount !== "") {
        const floatAmount = Math.abs(parseFloat(this.creditAmount));
        if (floatAmount > 0) {
          this.creditAmount = parseFloat((Math.round(floatAmount * 100) / 100).toString())
            .toFixed(2)
            .toString();
          return;
        }
      }
    } catch (e) {
      this.logService.error(e);
    }
    this.creditAmount = "";
  }

  get creditAmountNumber(): number {
    if (this.creditAmount != null && this.creditAmount !== "") {
      try {
        return parseFloat(this.creditAmount);
      } catch (e) {
        this.logService.error(e);
      }
    }
    return null;
  }
}
