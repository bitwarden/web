import { Component, Input } from "@angular/core";

import { ProviderUserBulkRequest } from "jslib-common/models/request/provider/providerUserBulkRequest";

import { BulkRemoveComponent as OrganizationBulkRemoveComponent } from "@bitwarden/web-vault-internal/app/organizations/manage/bulk/bulk-remove.component";

@Component({
  templateUrl:
    "../../../../../../web-vault-internal/src/app/organizations/manage/bulk/bulk-remove.component.html",
})
export class BulkRemoveComponent extends OrganizationBulkRemoveComponent {
  @Input() providerId: string;

  async deleteUsers() {
    const request = new ProviderUserBulkRequest(this.users.map((user) => user.id));
    return await this.apiService.deleteManyProviderUsers(this.providerId, request);
  }
}
