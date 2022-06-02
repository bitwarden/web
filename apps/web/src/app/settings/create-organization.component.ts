import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs/operators";

import { PlanType } from "jslib-common/enums/planType";
import { ProductType } from "jslib-common/enums/productType";

import { OrganizationPlansComponent } from "./organization-plans.component";

@Component({
  selector: "app-create-organization",
  templateUrl: "create-organization.component.html",
})
export class CreateOrganizationComponent implements OnInit {
  @ViewChild(OrganizationPlansComponent, { static: true })
  orgPlansComponent: OrganizationPlansComponent;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
      if (qParams.plan === "families") {
        this.orgPlansComponent.plan = PlanType.FamiliesAnnually;
        this.orgPlansComponent.product = ProductType.Families;
      } else if (qParams.plan === "teams") {
        this.orgPlansComponent.plan = PlanType.TeamsAnnually;
        this.orgPlansComponent.product = ProductType.Teams;
      } else if (qParams.plan === "enterprise") {
        this.orgPlansComponent.plan = PlanType.EnterpriseAnnually;
        this.orgPlansComponent.product = ProductType.Enterprise;
      }
    });
  }
}
