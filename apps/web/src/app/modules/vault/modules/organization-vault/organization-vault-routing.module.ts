import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { OrganizationVaultComponent } from "./organization-vault.component";
const routes: Routes = [
  {
    path: "",
    component: OrganizationVaultComponent,
    data: { titleId: "vaults" },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationVaultRoutingModule {}
