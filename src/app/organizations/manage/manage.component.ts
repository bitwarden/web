import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { Organization } from "jslib-common/models/domain/organization";

@Component({
  selector: "app-org-manage",
  templateUrl: "manage.component.html",
})
export class ManageComponent implements OnInit {
  organization: Organization;
  accessPolicies = false;
  accessGroups = false;
  accessEvents = false;
  accessSso = false;

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      this.organization = await this.organizationService.get(params.organizationId);
      this.accessPolicies = this.organization.usePolicies;
      this.accessSso = this.organization.useSso;
      this.accessEvents = this.organization.useEvents;
      this.accessGroups = this.organization.useGroups;
    });
  }
}
