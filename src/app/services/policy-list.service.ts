import { BasePolicy } from "../organizations/policies/base-policy.component";

export class PolicyListService {
  private policies: BasePolicy[] = [];

  addPolicies(policies: BasePolicy[]) {
    this.policies.push(...policies);
  }

  getPolicies(): BasePolicy[] {
    return this.policies;
  }
}
