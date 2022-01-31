import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { BitwardenToastModule } from "jslib-angular/components/toastr.component";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { OrganizationsModule } from "./organizations/organizations.module";
import { DisablePersonalVaultExportPolicyComponent } from "./policies/disable-personal-vault-export.component";
import { MaximumVaultTimeoutPolicyComponent } from "./policies/maximum-vault-timeout.component";

import { OssRoutingModule } from "@bitwarden/web-vault-internal/app/oss-routing.module";
import { OssModule } from "@bitwarden/web-vault-internal/app/oss.module";
import { ServicesModule } from "@bitwarden/web-vault-internal/app/services/services.module";
import { WildcardRoutingModule } from "@bitwarden/web-vault-internal/app/wildcard-routing.module";

@NgModule({
  imports: [
    OssModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ServicesModule,
    BitwardenToastModule.forRoot({
      maxOpened: 5,
      autoDismiss: true,
      closeButton: true,
    }),
    InfiniteScrollModule,
    DragDropModule,
    AppRoutingModule,
    OssRoutingModule,
    OrganizationsModule,
    RouterModule,
    WildcardRoutingModule, // Needs to be last to catch all non-existing routes
  ],
  declarations: [
    AppComponent,
    MaximumVaultTimeoutPolicyComponent,
    DisablePersonalVaultExportPolicyComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
