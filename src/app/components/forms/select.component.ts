import { Component, Input } from "@angular/core";

import { SelectOptions } from "jslib-angular/interfaces/selectOptions";

import { BaseCvaComponent } from "./base-cva.component";

@Component({
  selector: "app-select",
  templateUrl: "select.component.html",
})
export class SelectComponent extends BaseCvaComponent {
  @Input() selectOptions: SelectOptions[];
}
