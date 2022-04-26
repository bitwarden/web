import { Component, OnDestroy, OnInit } from "@angular/core";

import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { ThemeType } from "jslib-common/enums/themeType";

interface Colors {
  shapeColor: string;
  lineColor: string;
}
@Component({
  selector: "app-subscription-hidden",
  templateUrl: "./subscription-hidden.svg",
})
export class SubscriptionHiddenComponent implements OnInit, OnDestroy {
  constructor(private platformUtilsService: PlatformUtilsService) {}

  themes: Partial<Record<ThemeType, { shape: string; line: string }>> = {
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

  private matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
  private onThemeChangeCallback = () => this.setColors();

  async ngOnInit() {
    await this.setColors();
    try {
      this.matchMedia.addEventListener("change", this.onThemeChangeCallback);
    } catch {
      // < Safari 14
      this.matchMedia.addListener(this.onThemeChangeCallback);
    }
  }

  ngOnDestroy() {
    try {
      this.matchMedia.removeEventListener("change", this.onThemeChangeCallback);
    } catch {
      // < Safari 14
      this.matchMedia.removeListener(this.onThemeChangeCallback);
    }
  }

  private async setColors() {
    const theme = await this.platformUtilsService.getEffectiveTheme();
    this.colors = this.themes[theme];
  }
}
