import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";

@Component({
  selector: "app-org-badge",
  templateUrl: "organization-name-badge.component.html",
})
export class OrganizationNameBadgeComponent implements OnInit {
  @Input() organizationName: string;
  @Input() profileName: string;

  @Output() onOrganizationClicked = new EventEmitter<string>();

  color: string;
  textColor: string;

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    if (this.organizationName == null || this.organizationName === "") {
      this.organizationName = this.i18nService.t("me");
      this.color = this.stringToColor(this.profileName.toUpperCase());
    }
    if (this.color == null) {
      this.color = this.stringToColor(this.organizationName.toUpperCase());
    }
    this.textColor = this.pickTextColorBasedOnBgColor();
  }

  // This value currently isn't stored anywhere, only calculated in the app-avatar component
  // Once we are allowing org colors to be changed and saved, change this out
  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }

  // There are a few ways to calculate text color for contrast, this one seems to fit accessibility guidelines best.
  // https://stackoverflow.com/a/3943023/6869691
  private pickTextColorBasedOnBgColor() {
    const color = this.color.charAt(0) === "#" ? this.color.substring(1, 7) : this.color;
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black !important" : "white !important";
  }

  emitOnOrganizationClicked() {
    this.onOrganizationClicked.emit();
  }
}
