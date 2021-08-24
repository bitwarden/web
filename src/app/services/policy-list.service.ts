import { BasePolicy } from '../organizations/policies/base-policy.component';

export class PolicyListService {
    private policies: BasePolicy[] = [];

    addPolicies(policies: BasePolicy[]) {
        policies.forEach(p => policies.push(p));
    }

    getPolicies(): BasePolicy[] {
        return this.policies;
    }
}
