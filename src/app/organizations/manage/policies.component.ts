import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PolicyType } from "jslib-common/enums/policyType";
import { Organization } from "jslib-common/models/domain/organization";
import { PolicyResponse } from "jslib-common/models/response/policyResponse";

import { PolicyListService } from "../../services/policy-list.service";
import { BasePolicy } from "../policies/base-policy.component";

import { PolicyEditComponent } from "./policy-edit.component";

@Component({
  selector: "app-org-policies",
  templateUrl: "policies.component.html",
})
export class PoliciesComponent implements OnInit {
  @ViewChild("editTemplate", { read: ViewContainerRef, static: true })
  editModalRef: ViewContainerRef;

  loading = true;
  organizationId: string;
  policies: BasePolicy[];
  organization: Organization;

  private orgPolicies: PolicyResponse[];
  private policiesEnabledMap: Map<PolicyType, boolean> = new Map<PolicyType, boolean>();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private modalService: ModalService,
    private organizationService: OrganizationService,
    private policyListService: PolicyListService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.organization = await this.organizationService.get(this.organizationId);
      if (this.organization == null || !this.organization.usePolicies) {
        this.router.navigate(["/organizations", this.organizationId]);
        return;
      }

      this.policies = this.policyListService.getPolicies();

      await this.load();

      // Handle policies component launch from Event message
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        if (qParams.policyId != null) {
          const policyIdFromEvents: string = qParams.policyId;
          for (const orgPolicy of this.orgPolicies) {
            if (orgPolicy.id === policyIdFromEvents) {
              for (let i = 0; i < this.policies.length; i++) {
                if (this.policies[i].type === orgPolicy.type) {
                  this.edit(this.policies[i]);
                  break;
                }
              }
              break;
            }
          }
        }
      });
    });
  }

  async load() {
    const response = await this.apiService.getPolicies(this.organizationId);
    this.orgPolicies = response.data != null && response.data.length > 0 ? response.data : [];
    this.orgPolicies.forEach((op) => {
      this.policiesEnabledMap.set(op.type, op.enabled);
    });

    this.loading = false;
  }

  async edit(policy: BasePolicy) {
    const [modal] = await this.modalService.openViewRef(
      PolicyEditComponent,
      this.editModalRef,
      (comp) => {
        comp.policy = policy;
        comp.organizationId = this.organizationId;
        comp.policiesEnabledMap = this.policiesEnabledMap;
        comp.onSavedPolicy.subscribe(() => {
          modal.close();
          this.load();
        });
      }
    );
  }
}
