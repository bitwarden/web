import { DragDropModule } from "@angular/cdk/drag-drop";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import { BitwardenToastModule } from "jslib-angular/components/toastr.component";

import { AppComponent } from "./app.component";
import { OssRoutingModule } from "./oss-routing.module";
import { OssModule } from "./oss.module";
import { ServicesModule } from "./services/services.module";
import { WildcardRoutingModule } from "./wildcard-routing.module";

@NgModule({
  imports: [
    OssModule,
    BrowserAnimationsModule,
    FormsModule,
    ServicesModule,
    BitwardenToastModule.forRoot({
      maxOpened: 5,
      autoDismiss: true,
      closeButton: true,
    }),
    InfiniteScrollModule,
    DragDropModule,
    OssRoutingModule,
    WildcardRoutingModule, // Needs to be last to catch all non-existing routes
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
