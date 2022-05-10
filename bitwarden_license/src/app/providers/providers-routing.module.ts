import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "jslib-angular/guards/auth.guard";
import { Permissions } from "jslib-common/enums/permissions";

import { FrontendLayoutComponent } from "src/app/layouts/frontend-layout.component";
import { ProvidersComponent } from "src/app/providers/providers.component";

import { ClientsComponent } from "./clients/clients.component";
import { CreateOrganizationComponent } from "./clients/create-organization.component";
import { PermissionsGuard } from "./guards/provider-type.guard";
import { ProviderGuard } from "./guards/provider.guard";
import { AcceptProviderComponent } from "./manage/accept-provider.component";
import { EventsComponent } from "./manage/events.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { ProvidersLayoutComponent } from "./providers-layout.component";
import { AccountComponent } from "./settings/account.component";
import { SettingsComponent } from "./settings/settings.component";
import { SetupProviderComponent } from "./setup/setup-provider.component";
import { SetupComponent } from "./setup/setup.component";

const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuard],
    component: ProvidersComponent,
  },
  {
    path: "",
    component: FrontendLayoutComponent,
    children: [
      {
        path: "setup-provider",
        component: SetupProviderComponent,
        data: { titleId: "setupProvider" },
      },
      {
        path: "accept-provider",
        component: AcceptProviderComponent,
        data: { titleId: "acceptProvider" },
      },
    ],
  },
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {
        path: "setup",
        component: SetupComponent,
      },
      {
        path: ":providerId",
        component: ProvidersLayoutComponent,
        canActivate: [ProviderGuard],
        children: [
          { path: "", pathMatch: "full", redirectTo: "clients" },
          { path: "clients/create", component: CreateOrganizationComponent },
          { path: "clients", component: ClientsComponent, data: { titleId: "clients" } },
          {
            path: "manage",
            component: ManageComponent,
            children: [
              {
                path: "",
                pathMatch: "full",
                redirectTo: "people",
              },
              {
                path: "people",
                component: PeopleComponent,
                canActivate: [PermissionsGuard],
                data: {
                  titleId: "people",
                  permissions: [Permissions.ManageUsers],
                },
              },
              {
                path: "events",
                component: EventsComponent,
                canActivate: [PermissionsGuard],
                data: {
                  titleId: "eventLogs",
                  permissions: [Permissions.AccessEventLogs],
                },
              },
            ],
          },
          {
            path: "settings",
            component: SettingsComponent,
            children: [
              {
                path: "",
                pathMatch: "full",
                redirectTo: "account",
              },
              {
                path: "account",
                component: AccountComponent,
                canActivate: [PermissionsGuard],
                data: {
                  titleId: "myProvider",
                  permissions: [Permissions.ManageProvider],
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProvidersRoutingModule {}
