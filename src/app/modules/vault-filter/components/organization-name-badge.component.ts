import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-org-badge",
  templateUrl: "organization-name-badge.component.html",
})
export class OrganizationNameBadgeComponent implements OnInit {
  @Input() organizationName: string;
  @Input() color: string;

  @Output() onOrganizationClicked = new EventEmitter<string>();

  textColor: string;

  ngOnInit(): void {
    const upperData = this.organizationName.toUpperCase();
    if (this.color == null) {
      this.color = this.stringToColor(upperData);
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

    const uicolors = [r / 255, g / 255, b / 255];
    const c = uicolors.map((c) => {
      if (c <= 0.03928) {
        return c / 12.92;
      } else {
        return Math.pow((c + 0.055) / 1.055, 2.4);
      }
    });

    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return L > 0.179 ? "black !important" : "white !important";
  }

  emitOnOrganizationClicked() {
    this.onOrganizationClicked.emit();
  }
}
