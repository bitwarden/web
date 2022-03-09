import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import "bootstrap";
import "jquery";
import "popper.js";

require("src/scss/styles.scss");
require("src/scss/tailwind.css");

import { AppModule } from "./app.module";

if (process.env.NODE_ENV === "production") {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });
