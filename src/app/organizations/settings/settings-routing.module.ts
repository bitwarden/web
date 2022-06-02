import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Permissions } from "jslib-common/enums/permissions";

import { PermissionsGuard } from "../guards/permissions.guard";
import { NavigationPermissionsService } from "../services/navigation-permissions.service";

import { AccountComponent } from "./account.component";
import { BillingComponent } from "./billing.component";
import { SettingsComponent } from "./settings.component";
import { SubscriptionComponent } from "./subscription.component";
import { TwoFactorSetupComponent } from "./two-factor-setup.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    canActivate: [PermissionsGuard],
    data: { permissions: NavigationPermissionsService.getPermissions("settings") },
    children: [
      { path: "", pathMatch: "full", redirectTo: "account" },
      { path: "account", component: AccountComponent, data: { titleId: "myOrganization" } },
      {
        path: "two-factor",
        component: TwoFactorSetupComponent,
        data: { titleId: "twoStepLogin" },
      },
      {
        path: "billing",
        component: BillingComponent,
        canActivate: [PermissionsGuard],
        data: { titleId: "billing", permissions: [Permissions.ManageBilling] },
      },
      {
        path: "subscription",
        component: SubscriptionComponent,
        data: { titleId: "subscription" },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
