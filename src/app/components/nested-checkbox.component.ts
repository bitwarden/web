import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Utils } from "jslib-common/misc/utils";

@Component({
  selector: "app-nested-checkbox",
  templateUrl: "nested-checkbox.component.html",
})
export class NestedCheckboxComponent {
  @Input() parentId: string;
  @Input() checkboxes: { id: string; get: () => boolean; set: (v: boolean) => void }[];
  @Output() onSavedUser = new EventEmitter();
  @Output() onDeletedUser = new EventEmitter();

  get parentIndeterminate() {
    return !this.parentChecked && this.checkboxes.some((c) => c.get());
  }

  get parentChecked() {
    return this.checkboxes.every((c) => c.get());
  }

  set parentChecked(value: boolean) {
    this.checkboxes.forEach((c) => {
      c.set(value);
    });
  }

  pascalize(s: string) {
    return Utils.camelToPascalCase(s);
  }
}
