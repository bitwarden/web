import { Component, EventEmitter, Output } from "@angular/core";

import { ThemeType } from "jslib-common/enums/themeType";

interface Colors {
  shapeColor: string;
  lineColor: string;
}
@Component({
  selector: "app-subscription-hidden",
  templateUrl: "./subscription-hidden.svg",
})
export class SubscriptionHiddenComponent {
  themes = {
    [ThemeType.Light]: {
      shape: "#E1E5EE",
      line: "#2F343D",
    },
    [ThemeType.Dark]: {
      shape: "#2F343D",
      line: "#E1E5EE",
    },
  };
  colors = this.themes[ThemeType.Light];
}
