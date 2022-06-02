import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { IndividualVaultComponent } from "./individual-vault.component";
const routes: Routes = [
  {
    path: "",
    component: IndividualVaultComponent,
    data: { titleId: "vaults" },
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndividualVaultRoutingModule {}
