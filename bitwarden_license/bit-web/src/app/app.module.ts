import { DragDropModule } from "@angular/cdk/drag-drop";
import { OverlayModule } from "@angular/cdk/overlay";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { JslibModule } from "jslib-angular/jslib.module";

import { OssRoutingModule } from "src/app/oss-routing.module";
import { OssModule } from "src/app/oss.module";
import { ServicesModule } from "src/app/services/services.module";
import { WildcardRoutingModule } from "src/app/wildcard-routing.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { OrganizationsModule } from "./organizations/organizations.module";
import { DisablePersonalVaultExportPolicyComponent } from "./policies/disable-personal-vault-export.component";
import { MaximumVaultTimeoutPolicyComponent } from "./policies/maximum-vault-timeout.component";

@NgModule({
  imports: [
    OverlayModule,
    OssModule,
    JslibModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ServicesModule,
    InfiniteScrollModule,
    DragDropModule,
    AppRoutingModule,
    OssRoutingModule,
    OrganizationsModule, // Must be after OssRoutingModule for competing routes to resolve properly
    RouterModule,
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
