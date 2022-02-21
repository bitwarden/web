import { Component, Input } from "@angular/core";

import { ISelectOptions } from "jslib-angular/interfaces/ISelectOptions";
import { BaseCvaComponent } from "./base-cva.component";

@Component({
  selector: "app-select",
  templateUrl: "select.component.html",
})
export class SelectComponent extends BaseCvaComponent {
  @Input() selectOptions: ISelectOptions[];
}
