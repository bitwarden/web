import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { PlanType } from 'jslib-common/enums/planType';
import { ProductType } from 'jslib-common/enums/productType';

@Component({
    selector: 'app-change-plan',
    templateUrl: 'change-plan.component.html',
})
export class ChangePlanComponent {
    @Input() organizationId: string;
    @Output() onChanged = new EventEmitter();
    @Output() onCanceled = new EventEmitter();

    formPromise: Promise<any>;
    defaultUpgradePlan: PlanType = PlanType.FamiliesAnnually;
    defaultUpgradeProduct: ProductType = ProductType.Families;

    constructor(private apiService: ApiService, private platformUtilsService: PlatformUtilsService) { }

    async submit() {
        try {
            this.onChanged.emit();
        } catch { }
    }

    cancel() {
        this.onCanceled.emit();
    }
}
