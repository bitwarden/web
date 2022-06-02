import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { OrganizationSubscriptionUpdateRequest } from "jslib-common/models/request/organizationSubscriptionUpdateRequest";

@Component({
  selector: "app-adjust-subscription",
  templateUrl: "adjust-subscription.component.html",
})
export class AdjustSubscription {
  @Input() organizationId: string;
  @Input() maxAutoscaleSeats: number;
  @Input() currentSeatCount: number;
  @Input() seatPrice = 0;
  @Input() interval = "year";
  @Output() onAdjusted = new EventEmitter();

  formPromise: Promise<any>;
  limitSubscription: boolean;
  newSeatCount: number;
  newMaxSeats: number;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  ngOnInit() {
    this.limitSubscription = this.maxAutoscaleSeats != null;
    this.newSeatCount = this.currentSeatCount;
    this.newMaxSeats = this.maxAutoscaleSeats;
  }

  async submit() {
    try {
      const seatAdjustment = this.newSeatCount - this.currentSeatCount;
      const request = new OrganizationSubscriptionUpdateRequest(seatAdjustment, this.newMaxSeats);
      this.formPromise = this.apiService.postOrganizationUpdateSubscription(
        this.organizationId,
        request
      );

      await this.formPromise;

      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("subscriptionUpdated")
      );
    } catch (e) {
      this.logService.error(e);
    }
    this.onAdjusted.emit();
  }

  limitSubscriptionChanged() {
    if (!this.limitSubscription) {
      this.newMaxSeats = null;
    }
  }

  get adjustedSeatTotal(): number {
    return this.newSeatCount * this.seatPrice;
  }

  get maxSeatTotal(): number {
    return this.newMaxSeats * this.seatPrice;
  }
}
