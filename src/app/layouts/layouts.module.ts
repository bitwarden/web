import { NgModule } from "@angular/core";

import { FooterComponent } from "../layouts/footer.component";
import { FrontendLayoutComponent } from "../layouts/frontend-layout.component";
import { NavbarComponent } from "../layouts/navbar.component";
import { SharedModule } from "../modules/shared.module";

@NgModule({
  imports: [SharedModule],
  declarations: [NavbarComponent, FooterComponent, FrontendLayoutComponent],
  exports: [NavbarComponent, FooterComponent],
})
export class LayoutsModule {}
