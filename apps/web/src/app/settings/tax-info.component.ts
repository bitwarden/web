import { Component, EventEmitter, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "jslib-common/abstractions/api.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationTaxInfoUpdateRequest } from "jslib-common/models/request/organizationTaxInfoUpdateRequest";
import { TaxInfoUpdateRequest } from "jslib-common/models/request/taxInfoUpdateRequest";
import { TaxRateResponse } from "jslib-common/models/response/taxRateResponse";

@Component({
  selector: "app-tax-info",
  templateUrl: "tax-info.component.html",
})
export class TaxInfoComponent {
  @Output() onCountryChanged = new EventEmitter();

  loading = true;
  organizationId: string;
  taxInfo: any = {
    taxId: null,
    line1: null,
    line2: null,
    city: null,
    state: null,
    postalCode: null,
    country: "US",
    includeTaxId: false,
  };

  taxRates: TaxRateResponse[];

  private pristine: any = {
    taxId: null,
    line1: null,
    line2: null,
    city: null,
    state: null,
    postalCode: null,
    country: "US",
    includeTaxId: false,
  };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      if (this.organizationId) {
        try {
          const taxInfo = await this.apiService.getOrganizationTaxInfo(this.organizationId);
          if (taxInfo) {
            this.taxInfo.taxId = taxInfo.taxId;
            this.taxInfo.state = taxInfo.state;
            this.taxInfo.line1 = taxInfo.line1;
            this.taxInfo.line2 = taxInfo.line2;
            this.taxInfo.city = taxInfo.city;
            this.taxInfo.state = taxInfo.state;
            this.taxInfo.postalCode = taxInfo.postalCode;
            this.taxInfo.country = taxInfo.country || "US";
            this.taxInfo.includeTaxId =
              this.taxInfo.country !== "US" &&
              (!!taxInfo.taxId ||
                !!taxInfo.line1 ||
                !!taxInfo.line2 ||
                !!taxInfo.city ||
                !!taxInfo.state);
          }
        } catch (e) {
          this.logService.error(e);
        }
      } else {
        try {
          const taxInfo = await this.apiService.getTaxInfo();
          if (taxInfo) {
            this.taxInfo.postalCode = taxInfo.postalCode;
            this.taxInfo.country = taxInfo.country || "US";
          }
        } catch (e) {
          this.logService.error(e);
        }
      }
      this.pristine = Object.assign({}, this.taxInfo);
      // If not the default (US) then trigger onCountryChanged
      if (this.taxInfo.country !== "US") {
        this.onCountryChanged.emit();
      }
    });

    try {
      const taxRates = await this.apiService.getTaxRates();
      if (taxRates) {
        this.taxRates = taxRates.data;
      }
    } catch (e) {
      this.logService.error(e);
    } finally {
      this.loading = false;
    }
  }

  get taxRate() {
    if (this.taxRates != null) {
      const localTaxRate = this.taxRates.find(
        (x) => x.country === this.taxInfo.country && x.postalCode === this.taxInfo.postalCode
      );
      return localTaxRate?.rate ?? null;
    }
  }

  getTaxInfoRequest(): TaxInfoUpdateRequest {
    if (this.organizationId) {
      const request = new OrganizationTaxInfoUpdateRequest();
      request.taxId = this.taxInfo.taxId;
      request.state = this.taxInfo.state;
      request.line1 = this.taxInfo.line1;
      request.line2 = this.taxInfo.line2;
      request.city = this.taxInfo.city;
      request.state = this.taxInfo.state;
      request.postalCode = this.taxInfo.postalCode;
      request.country = this.taxInfo.country;
      return request;
    } else {
      const request = new TaxInfoUpdateRequest();
      request.postalCode = this.taxInfo.postalCode;
      request.country = this.taxInfo.country;
      return request;
    }
  }

  submitTaxInfo(): Promise<any> {
    if (!this.hasChanged()) {
      return new Promise<void>((resolve) => {
        resolve();
      });
    }
    const request = this.getTaxInfoRequest();
    return this.organizationId
      ? this.apiService.putOrganizationTaxInfo(
          this.organizationId,
          request as OrganizationTaxInfoUpdateRequest
        )
      : this.apiService.putTaxInfo(request);
  }

  changeCountry() {
    if (this.taxInfo.country === "US") {
      this.taxInfo.includeTaxId = false;
      this.taxInfo.taxId = null;
      this.taxInfo.line1 = null;
      this.taxInfo.line2 = null;
      this.taxInfo.city = null;
      this.taxInfo.state = null;
    }
    this.onCountryChanged.emit();
  }

  private hasChanged(): boolean {
    for (const key in this.taxInfo) {
      // eslint-disable-next-line
      if (this.pristine.hasOwnProperty(key) && this.pristine[key] !== this.taxInfo[key]) {
        return true;
      }
    }
    return false;
  }
}
