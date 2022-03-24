import "core-js/stable";
require("zone.js/dist/zone");

// IE11 fix, ref: https://github.com/angular/angular/issues/24769
if (!Element.prototype.matches && (Element.prototype as any).msMatchesSelector) {
  Element.prototype.matches = (Element.prototype as any).msMatchesSelector;
}

if (process.env.NODE_ENV === "production") {
  // Production
} else {
  // Development and test
  Error["stackTraceLimit"] = Infinity;
  require("zone.js/dist/long-stack-trace-zone");
}

// Other polyfills
require("whatwg-fetch");
require("webcrypto-shim");
require("date-input-polyfill");
