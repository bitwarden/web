import { Injectable } from "@angular/core";

import { BasePolicy } from "../organizations/policies/base-policy.component";

@Injectable()
export class PolicyListService {
  private policies: BasePolicy[] = [];

  addPolicies(policies: BasePolicy[]) {
    this.policies.push(...policies);
  }

  getPolicies(): BasePolicy[] {
    return this.policies;
  }
}
