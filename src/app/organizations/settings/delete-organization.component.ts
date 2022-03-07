import { Component, EventEmitter, OnInit, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { Utils } from "jslib-common/misc/utils";
import { CipherView } from "jslib-common/models/view/cipherView";
import { Verification } from "jslib-common/types/verification";

class CountBasedLocalizationKey {
  singular: string;
  plural: string;

  getKey(count: number) {
    return count == 1 ? this.singular : this.plural;
  }

  constructor(singular: string, plural: string) {
    this.singular = singular;
    this.plural = plural;
  }
}

class OrganizationContentSummaryItem {
  count: number;
  get localizationKey(): string {
    return this.localizationKeyOptions.getKey(this.count);
  }
  private localizationKeyOptions: CountBasedLocalizationKey;
  constructor(count: number, localizationKeyOptions: CountBasedLocalizationKey) {
    this.count = count;
    this.localizationKeyOptions = localizationKeyOptions;
  }
}

class OrganizationContentSummary {
  totalItemCount = 0;
  itemCountByType: OrganizationContentSummaryItem[] = [];
}

@Component({
  selector: "app-delete-organization",
  templateUrl: "delete-organization.component.html",
})
export class DeleteOrganizationComponent implements OnInit {
  organizationId: string;
  loaded: boolean;
  deleteOrganizationRequestType: "InvalidFamiliesForEnterprise" | "RegularDelete" = "RegularDelete";
  organizationName: string;
  organizationContentSummary: OrganizationContentSummary = new OrganizationContentSummary();
  @Output() onSuccess: EventEmitter<any> = new EventEmitter();

  masterPassword: Verification;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private logService: LogService,
    private cipherService: CipherService,
    private organizationService: OrganizationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.apiService.deleteOrganization(this.organizationId, request));
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("organizationDeleted"),
        this.i18nService.t("organizationDeletedDesc")
      );
      this.onSuccess.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async load() {
    this.organizationName = (await this.organizationService.get(this.organizationId)).name;
    this.organizationContentSummary = await this.buildOrganizationContentSummary();
    this.loaded = true;
  }

  private async buildOrganizationContentSummary(): Promise<OrganizationContentSummary> {
    const organizationContentSummary = new OrganizationContentSummary();
    const organizationItems = (
      await this.cipherService.getAllFromApiForOrganization(this.organizationId)
    ).filter((item) => item.deletedDate == null);

    if (organizationItems.length < 1) {
      return organizationContentSummary;
    }

    organizationContentSummary.totalItemCount = organizationItems.length;
    for (const cipherType of Utils.iterateEnum(CipherType)) {
      const count = this.getOrganizationItemCountByType(organizationItems, cipherType);
      if (count > 0) {
        organizationContentSummary.itemCountByType.push(
          new OrganizationContentSummaryItem(
            count,
            this.getOrganizationItemLocalizationKeysByType(CipherType[cipherType])
          )
        );
      }
    }

    return organizationContentSummary;
  }

  private getOrganizationItemCountByType(items: CipherView[], type: CipherType) {
    return items.filter((item) => item.type == type).length;
  }

  private getOrganizationItemLocalizationKeysByType(type: string): CountBasedLocalizationKey {
    return new CountBasedLocalizationKey(`type${type}`, `type${type}Plural`);
  }
}
