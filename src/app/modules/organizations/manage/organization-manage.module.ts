import { ScrollingModule } from "@angular/cdk/scrolling";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../shared.module";

import { EntityUsersComponent } from "./entity-users.component";

@NgModule({
  imports: [SharedModule, ScrollingModule],
  declarations: [EntityUsersComponent],
  exports: [EntityUsersComponent],
})
export class OrganizationManageModule {}
