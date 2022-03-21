import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { JslibModule } from "jslib-angular/jslib.module";

import { OssRoutingModule } from "src/app/oss-routing.module";
import { ServicesModule } from "src/app/services/services.module";
import { WildcardRoutingModule } from "src/app/wildcard-routing.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { OrganizationsModule } from "./organizations/organizations.module";
import { DisablePersonalVaultExportPolicyComponent } from "./policies/disable-personal-vault-export.component";
import { MaximumVaultTimeoutPolicyComponent } from "./policies/maximum-vault-timeout.component";

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    DragDropModule,
    FormsModule,
    InfiniteScrollModule,
    JslibModule,
    OrganizationsModule,
    OssRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    ServicesModule,
    WildcardRoutingModule, // Needs to be last to catch all non-existing routes
  ],
  declarations: [
    AppComponent,
    DisablePersonalVaultExportPolicyComponent,
    MaximumVaultTimeoutPolicyComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
