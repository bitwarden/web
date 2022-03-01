import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-org-tools",
  templateUrl: "tools.component.html",
})
export class ToolsComponent {
  organization: Organization;
  accessReports = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private messagingService: MessagingService
  ) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      // TODO: Maybe we want to just make sure they are not on a free plan? Just compare useTotp for now
      // since all paid plans include useTotp
      this.accessReports = this.organization.useTotp;
      this.loading = false;
    });
  }

  upgradeOrganization() {
    this.messagingService.send("upgradeOrganization", { organizationId: this.organization.id });
  }
}
