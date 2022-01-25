import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import "bootstrap";
import "jquery";
import "popper.js";

import { AppModule } from "./app/app.module";

// TODO: Investigate if we can use environment.
// import { environment } from './environments/environment';

if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
