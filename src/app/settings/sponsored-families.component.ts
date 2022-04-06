import { Component, OnInit } from "@angular/core";

import { ValidationService } from "jslib-angular/services/validation.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { PlanSponsorshipType } from "jslib-common/enums/planSponsorshipType";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-sponsored-families",
  templateUrl: "sponsored-families.component.html",
})
export class SponsoredFamiliesComponent implements OnInit {
  loading = false;

  availableSponsorshipOrgs: Organization[] = [];
  activeSponsorshipOrgs: Organization[] = [];
  selectedSponsorshipOrgId = "";
  sponsorshipEmail = "";
  currentUserEmail: string;

  // Conditional display properties
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private syncService: SyncService,
    private organizationService: OrganizationService,
    private validationService: ValidationService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async submit() {
    if (this.currentUserEmail.toLowerCase() === this.sponsorshipEmail.toLowerCase()) {
      this.validationService.showError(this.i18nService.t("cannotSponsorSelf"));
      return;
    }

    this.formPromise = this.apiService.postCreateSponsorship(this.selectedSponsorshipOrgId, {
      sponsoredEmail: this.sponsorshipEmail,
      planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
      friendlyName: this.sponsorshipEmail,
    });

    await this.formPromise;
    this.platformUtilsService.showToast("success", null, this.i18nService.t("sponsorshipCreated"));
    this.formPromise = null;
    this.resetForm();
    await this.load(true);
  }

  async load(forceReload = false) {
    if (this.loading) {
      return;
    }
    this.loading = true;

    this.currentUserEmail = await this.stateService.getEmail();

    if (forceReload) {
      await this.syncService.fullSync(true);
    }

    const allOrgs = await this.organizationService.getAll();
    this.availableSponsorshipOrgs = allOrgs.filter((org) => org.familySponsorshipAvailable);

    this.activeSponsorshipOrgs = allOrgs.filter(
      (org) => org.familySponsorshipFriendlyName !== null
    );

    if (this.availableSponsorshipOrgs.length === 1) {
      this.selectedSponsorshipOrgId = this.availableSponsorshipOrgs[0].id;
    }
    this.loading = false;
  }

  private async resetForm() {
    this.sponsorshipEmail = "";
    this.selectedSponsorshipOrgId = "";
  }

  get anyActiveSponsorships(): boolean {
    return this.activeSponsorshipOrgs.length > 0;
  }

  get anyOrgsAvailable(): boolean {
    return this.availableSponsorshipOrgs.length > 0;
  }

  get moreThanOneOrgAvailable(): boolean {
    return this.availableSponsorshipOrgs.length > 1;
  }
}
