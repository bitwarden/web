import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { ValidationService } from "jslib-angular/services/validation.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { PlanSponsorshipType } from "jslib-common/enums/planSponsorshipType";
import { PlanType } from "jslib-common/enums/planType";
import { ProductType } from "jslib-common/enums/productType";
import { Organization } from "jslib-common/models/domain/organization";
import { OrganizationSponsorshipRedeemRequest } from "jslib-common/models/request/organization/organizationSponsorshipRedeemRequest";

import { DeleteOrganizationComponent } from "src/app/organizations/settings/delete-organization.component";
import { OrganizationPlansComponent } from "src/app/settings/organization-plans.component";

@Component({
  selector: "families-for-enterprise-setup",
  templateUrl: "families-for-enterprise-setup.component.html",
})
export class FamiliesForEnterpriseSetupComponent implements OnInit {
  @ViewChild(OrganizationPlansComponent, { static: false })
  set organizationPlansComponent(value: OrganizationPlansComponent) {
    if (!value) {
      return;
    }

    value.plan = PlanType.FamiliesAnnually;
    value.product = ProductType.Families;
    value.acceptingSponsorship = true;
    value.onSuccess.subscribe(this.onOrganizationCreateSuccess.bind(this));
  }

  @ViewChild("deleteOrganizationTemplate", { read: ViewContainerRef, static: true })
  deleteModalRef: ViewContainerRef;

  loading = true;
  badToken = false;
  formPromise: Promise<any>;

  token: string;
  existingFamilyOrganizations: Organization[];

  showNewOrganization = false;
  _organizationPlansComponent: OrganizationPlansComponent;
  _selectedFamilyOrganizationId = "";

  constructor(
    private router: Router,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private syncService: SyncService,
    private validationService: ValidationService,
    private organizationService: OrganizationService,
    private modalService: ModalService
  ) {}

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      const error = qParams.token == null;
      if (error) {
        this.platformUtilsService.showToast(
          "error",
          null,
          this.i18nService.t("sponsoredFamiliesAcceptFailed"),
          { timeout: 10000 }
        );
        this.router.navigate(["/"]);
        return;
      }

      this.token = qParams.token;

      await this.syncService.fullSync(true);
      this.badToken = !(await this.apiService.postPreValidateSponsorshipToken(this.token));
      this.loading = false;

      this.existingFamilyOrganizations = (await this.organizationService.getAll()).filter(
        (o) => o.planProductType === ProductType.Families
      );

      if (this.existingFamilyOrganizations.length === 0) {
        this.selectedFamilyOrganizationId = "createNew";
      }
    });
  }

  async submit() {
    this.formPromise = this.doSubmit(this._selectedFamilyOrganizationId);
    await this.formPromise;
    this.formPromise = null;
  }

  get selectedFamilyOrganizationId() {
    return this._selectedFamilyOrganizationId;
  }

  set selectedFamilyOrganizationId(value: string) {
    this._selectedFamilyOrganizationId = value;
    this.showNewOrganization = value === "createNew";
  }

  private async doSubmit(organizationId: string) {
    try {
      const request = new OrganizationSponsorshipRedeemRequest();
      request.planSponsorshipType = PlanSponsorshipType.FamiliesForEnterprise;
      request.sponsoredOrganizationId = organizationId;

      await this.apiService.postRedeemSponsorship(this.token, request);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("sponsoredFamiliesOfferRedeemed")
      );
      await this.syncService.fullSync(true);

      this.router.navigate(["/"]);
    } catch (e) {
      if (this.showNewOrganization) {
        await this.modalService.openViewRef(
          DeleteOrganizationComponent,
          this.deleteModalRef,
          (comp) => {
            comp.organizationId = organizationId;
            comp.deleteOrganizationRequestType = "InvalidFamiliesForEnterprise";
            comp.onSuccess.subscribe(() => {
              this.router.navigate(["/"]);
            });
          }
        );
      }
      this.validationService.showError(this.i18nService.t("sponsorshipTokenHasExpired"));
    }
  }

  private async onOrganizationCreateSuccess(value: any) {
    // Use newly created organization id
    await this.doSubmit(value.organizationId);
  }
}
