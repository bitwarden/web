import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { OssModule } from "src/app/oss.module";

import { SsoComponent } from "./manage/sso.component";
import { OrganizationsRoutingModule } from "./organizations-routing.module";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule, OssModule, OrganizationsRoutingModule],
    declarations: [SsoComponent],
})
export class OrganizationsModule {}
