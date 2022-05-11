import { Component } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationConnectionType } from "jslib-common/enums/organizationConnectionType";
import { Utils } from "jslib-common/misc/utils";
import { BillingSyncConfigApi } from "jslib-common/models/api/billingSyncConfigApi";
import { BillingSyncConfigRequest } from "jslib-common/models/request/billingSyncConfigRequest";
import { OrganizationConnectionRequest } from "jslib-common/models/request/organizationConnectionRequest";
import { OrganizationConnectionResponse } from "jslib-common/models/response/organizationConnectionResponse";

@Component({
  selector: "app-billing-sync-key",
  templateUrl: "billing-sync-key.component.html",
})
export class BillingSyncKeyComponent {
  entityId: string;
  existingConnectionId: string;
  billingSyncKey: string;
  setParentConnection: (connection: OrganizationConnectionResponse<BillingSyncConfigApi>) => void;

  formPromise: Promise<OrganizationConnectionResponse<BillingSyncConfigApi>> | Promise<void>;

  constructor(private apiService: ApiService, private logService: LogService) {}

  async submit() {
    try {
      const request = new OrganizationConnectionRequest(
        this.entityId,
        OrganizationConnectionType.CloudBillingSync,
        true,
        new BillingSyncConfigRequest(this.billingSyncKey)
      );
      if (this.existingConnectionId == null) {
        this.formPromise = this.apiService.createOrganizationConnection(
          request,
          BillingSyncConfigApi
        );
      } else {
        this.formPromise = this.apiService.updateOrganizationConnection(
          request,
          BillingSyncConfigApi,
          this.existingConnectionId
        );
      }
      const response = (await this
        .formPromise) as OrganizationConnectionResponse<BillingSyncConfigApi>;
      this.existingConnectionId = response?.id;
      this.billingSyncKey = response?.config?.billingSyncKey;
      this.setParentConnection(response);
    } catch (e) {
      this.logService.error(e);
    }
  }

  async deleteConnection() {
    this.formPromise = this.apiService.deleteOrganizationConnection(this.existingConnectionId);
    await this.formPromise;
    this.setParentConnection(null);
  }
}
