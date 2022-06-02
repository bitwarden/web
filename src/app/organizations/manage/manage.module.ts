import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { SharedModule } from "../../modules/shared.module";
import { PoliciesModule } from "../policies/policies.module";

import { BulkConfirmComponent } from "./bulk/bulk-confirm.component";
import { BulkRemoveComponent } from "./bulk/bulk-remove.component";
import { BulkStatusComponent } from "./bulk/bulk-status.component";
import { CollectionAddEditComponent } from "./collection-add-edit.component";
import { CollectionsComponent as ManageCollectionsComponent } from "./collections.component";
import { EntityEventsComponent } from "./entity-events.component";
import { EventsComponent } from "./events.component";
import { GroupAddEditComponent } from "./group-add-edit.component";
import { GroupsComponent } from "./groups.component";
import { ManageRoutingModule } from "./manage-routing.module";
import { ManageComponent } from "./manage.component";
import { PeopleComponent } from "./people.component";
import { PolicyEditComponent } from "./policy-edit.component";
import { ResetPasswordComponent } from "./reset-password.component";
import { UserAddEditComponent } from "./user-add-edit.component";
import { UserConfirmComponent } from "./user-confirm.component";
import { UserGroupsComponent } from "./user-groups.component";

@NgModule({
  imports: [CommonModule, SharedModule, PoliciesModule, ManageRoutingModule],
  declarations: [
    BulkConfirmComponent,
    BulkRemoveComponent,
    BulkStatusComponent,
    CollectionAddEditComponent,
    EntityEventsComponent,
    EventsComponent,
    GroupAddEditComponent,
    GroupsComponent,
    ManageCollectionsComponent,
    ManageComponent,
    PeopleComponent,
    PolicyEditComponent,
    ResetPasswordComponent,
    UserAddEditComponent,
    UserConfirmComponent,
    UserGroupsComponent,
  ],
})
export class ManageModule {}
