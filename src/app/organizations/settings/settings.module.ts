import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../modules/shared.module";

import { AccountComponent } from "./account.component";
import { AdjustSubscription } from "./adjust-subscription.component";
import { BillingSyncApiKeyComponent } from "./billing-sync-api-key.component";
import { BillingComponent } from "./billing.component";
import { ChangePlanComponent } from "./change-plan.component";
import { DeleteOrganizationComponent } from "./delete-organization.component";
import { DownloadLicenseComponent } from "./download-license.component";
import { ImageSubscriptionHiddenComponent } from "./image-subscription-hidden.component";
import { SettingsComponent } from "./settings.component";
import { SubscriptionComponent } from "./subscription.component";
import { TwoFactorSetupComponent } from "./two-factor-setup.component";

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [
    AccountComponent,
    AdjustSubscription,
    BillingComponent,
    BillingSyncApiKeyComponent,
    ChangePlanComponent,
    DeleteOrganizationComponent,
    DownloadLicenseComponent,
    ImageSubscriptionHiddenComponent,
    SettingsComponent,
    SubscriptionComponent,
    TwoFactorSetupComponent,
  ],
})
export class SettingsModule {}
