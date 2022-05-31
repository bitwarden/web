import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { notAllowedValueAsync } from "jslib-angular/validators/notAllowedValueAsync.validator";
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

  // Conditional display properties
  formPromise: Promise<any>;

  sponsorshipForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private syncService: SyncService,
    private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private stateService: StateService
  ) {
    this.sponsorshipForm = this.formBuilder.group({
      selectedSponsorshipOrgId: [
        "",
        {
          validators: [Validators.required],
        },
      ],
      sponsorshipEmail: [
        "",
        {
          validators: [Validators.email],
          asyncValidators: [
            notAllowedValueAsync(async () => await this.stateService.getEmail(), true),
          ],
          updateOn: "blur",
        },
      ],
    });
  }

  async ngOnInit() {
    await this.load();
  }

  async submit() {
    this.formPromise = this.apiService.postCreateSponsorship(
      this.sponsorshipForm.value.selectedSponsorshipOrgId,
      {
        sponsoredEmail: this.sponsorshipForm.value.sponsorshipEmail,
        planSponsorshipType: PlanSponsorshipType.FamiliesForEnterprise,
        friendlyName: this.sponsorshipForm.value.sponsorshipEmail,
      }
    );

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
    if (forceReload) {
      await this.syncService.fullSync(true);
    }

    const allOrgs = await this.organizationService.getAll();
    this.availableSponsorshipOrgs = allOrgs.filter((org) => org.familySponsorshipAvailable);

    this.activeSponsorshipOrgs = allOrgs.filter(
      (org) => org.familySponsorshipFriendlyName !== null
    );

    if (this.availableSponsorshipOrgs.length === 1) {
      this.sponsorshipForm.patchValue({
        selectedSponsorshipOrgId: this.availableSponsorshipOrgs[0].id,
      });
    }
    this.loading = false;
  }

  get sponsorshipEmailControl() {
    return this.sponsorshipForm.controls["sponsorshipEmail"];
  }

  private async resetForm() {
    this.sponsorshipForm.reset();
  }

  get anyActiveSponsorships(): boolean {
    return this.activeSponsorshipOrgs.length > 0;
  }

  get anyOrgsAvailable(): boolean {
    return this.availableSponsorshipOrgs.length > 0;
  }

  get isSelfHosted(): boolean {
    return this.platformUtilsService.isSelfHost();
  }
}
