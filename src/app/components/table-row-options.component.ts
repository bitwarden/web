import { Component, Input } from "@angular/core";

@Component({
  selector: "app-table-row-options",
  templateUrl: "table-row-options.component.html",
})
export class TableRowOptionsComponent {
  @Input() rowSuffix = 0;
}
