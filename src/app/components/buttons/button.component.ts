import { Component, Input } from "@angular/core";

const defaultStyling = ["tw-border", "tw-rounded", "tw-px-4", "tw-py-2", "tw-font-semibold"];

const styleLookup: Record<string, (type: string) => string[]> = {
  regular: (type: string) => [
    `tw-border-${type}`,
    `tw-bg-${type}`,
    `tw-text-${type}-btn-text`,
    `hover:tw-bg-${type}-btn-hover`,
  ],
  outline: (type: string) => [
    `tw-border-${type}`,
    `tw-text-${type}-btn-text`,
    `hover:tw-bg-${type}`,
  ],
};

@Component({
  selector: "btw-button",
  templateUrl: "./button.component.html",
})
export class ButtonComponent {
  @Input() type: string = "primary";
  @Input() buttonStyle: string = "regular";

  classes() {
    return defaultStyling.concat(styleLookup[this.buttonStyle]?.(this.type) ?? []);
  }
}
