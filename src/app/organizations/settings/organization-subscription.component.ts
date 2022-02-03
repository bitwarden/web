import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PlanType } from "jslib-common/enums/planType";
import { Organization } from "jslib-common/models/domain/organization";
import { OrganizationSubscriptionResponse } from "jslib-common/models/response/organizationSubscriptionResponse";

@Component({
  selector: "app-org-subscription",
  templateUrl: "organization-subscription.component.html",
})
export class OrganizationSubscriptionComponent implements OnInit {
  loading = false;
  firstLoaded = false;
  organizationId: string;
  adjustSeatsAdd = true;
  showAdjustSeats = false;
  showAdjustSeatAutoscale = false;
  adjustStorageAdd = true;
  showAdjustStorage = false;
  showUpdateLicense = false;
  showDownloadLicense = false;
  showChangePlan = false;
  sub: OrganizationSubscriptionResponse;
  selfHosted = false;

  userOrg: Organization;

  removeSponsorshipPromise: Promise<any>;
  cancelPromise: Promise<any>;
  reinstatePromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private logService: LogService
  ) {
    this.selfHosted = platformUtilsService.isSelfHost();
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load();
      this.firstLoaded = true;
    });
  }

  async load() {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.userOrg = await this.organizationService.get(this.organizationId);
    this.sub = await this.apiService.getOrganizationSubscription(this.organizationId);
    this.loading = false;
  }

  async reinstate() {
    if (this.loading) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("reinstateConfirmation"),
      this.i18nService.t("reinstateSubscription"),
      this.i18nService.t("yes"),
      this.i18nService.t("cancel")
    );
    if (!confirmed) {
      return;
    }

    try {
      this.reinstatePromise = this.apiService.postOrganizationReinstate(this.organizationId);
      await this.reinstatePromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("reinstated"));
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async cancel() {
    if (this.loading) {
      return;
    }

    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("cancelConfirmation"),
      this.i18nService.t("cancelSubscription"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }

    try {
      this.cancelPromise = this.apiService.postOrganizationCancel(this.organizationId);
      await this.cancelPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("canceledSubscription")
      );
      this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async changePlan() {
    this.showChangePlan = !this.showChangePlan;
  }

  closeChangePlan(changed: boolean) {
    this.showChangePlan = false;
  }

  downloadLicense() {
    this.showDownloadLicense = !this.showDownloadLicense;
  }

  closeDownloadLicense() {
    this.showDownloadLicense = false;
  }

  updateLicense() {
    if (this.loading) {
      return;
    }
    this.showUpdateLicense = true;
  }

  closeUpdateLicense(updated: boolean) {
    this.showUpdateLicense = false;
    if (updated) {
      this.load();
      this.messagingService.send("updatedOrgLicense");
    }
  }

  subscriptionAdjusted() {
    this.load();
  }

  adjustStorage(add: boolean) {
    this.adjustStorageAdd = add;
    this.showAdjustStorage = true;
  }

  closeStorage(load: boolean) {
    this.showAdjustStorage = false;
    if (load) {
      this.load();
    }
  }

  async removeSponsorship() {
    const isConfirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("removeSponsorshipConfirmation"),
      this.i18nService.t("removeSponsorship"),
      this.i18nService.t("remove"),
      this.i18nService.t("cancel"),
      "warning"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      this.removeSponsorshipPromise = this.apiService.deleteRemoveSponsorship(this.organizationId);
      await this.removeSponsorshipPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removeSponsorshipSuccess")
      );
      await this.load();
    } catch (e) {
      this.logService.error(e);
    }
  }

  get isExpired() {
    return (
      this.sub != null && this.sub.expiration != null && new Date(this.sub.expiration) < new Date()
    );
  }

  get subscriptionMarkedForCancel() {
    return (
      this.subscription != null && !this.subscription.cancelled && this.subscription.cancelAtEndDate
    );
  }

  get subscription() {
    return this.sub != null ? this.sub.subscription : null;
  }

  get nextInvoice() {
    return this.sub != null ? this.sub.upcomingInvoice : null;
  }

  get storagePercentage() {
    return this.sub != null && this.sub.maxStorageGb
      ? +(100 * (this.sub.storageGb / this.sub.maxStorageGb)).toFixed(2)
      : 0;
  }

  get storageProgressWidth() {
    return this.storagePercentage < 5 ? 5 : 0;
  }

  get billingInterval() {
    const monthly = !this.sub.plan.isAnnual;
    return monthly ? "month" : "year";
  }

  get storageGbPrice() {
    return this.sub.plan.additionalStoragePricePerGb;
  }

  get seatPrice() {
    return this.sub.plan.seatPrice;
  }

  get seats() {
    return this.sub.seats;
  }

  get maxAutoscaleSeats() {
    return this.sub.maxAutoscaleSeats;
  }

  get canAdjustSeats() {
    return this.sub.plan.hasAdditionalSeatsOption;
  }

  get isSponsoredSubscription(): boolean {
    return this.sub.subscription?.items.some((i) => i.sponsoredSubscriptionItem);
  }

  get canDownloadLicense() {
    return (
      (this.sub.planType !== PlanType.Free && this.subscription == null) ||
      (this.subscription != null && !this.subscription.cancelled)
    );
  }

  get subscriptionDesc() {
    if (this.sub.planType === PlanType.Free) {
      return this.i18nService.t("subscriptionFreePlan", this.sub.seats.toString());
    } else if (
      this.sub.planType === PlanType.FamiliesAnnually ||
      this.sub.planType === PlanType.FamiliesAnnually2019
    ) {
      if (this.isSponsoredSubscription) {
        return this.i18nService.t("subscriptionSponsoredFamiliesPlan", this.sub.seats.toString());
      } else {
        return this.i18nService.t("subscriptionFamiliesPlan", this.sub.seats.toString());
      }
    } else if (this.sub.maxAutoscaleSeats === this.sub.seats && this.sub.seats != null) {
      return this.i18nService.t("subscriptionMaxReached", this.sub.seats.toString());
    } else if (this.sub.maxAutoscaleSeats == null) {
      return this.i18nService.t("subscriptionUserSeatsUnlimitedAutoscale");
    } else {
      return this.i18nService.t(
        "subscriptionUserSeatsLimitedAutoscale",
        this.sub.maxAutoscaleSeats.toString()
      );
    }
  }

  get showChangePlanButton() {
    return this.subscription == null && this.sub.planType === PlanType.Free && !this.showChangePlan;
  }
}
