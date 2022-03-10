import { Component, Input } from "@angular/core";

@Component({
  selector: "app-table-row-option-menu",
  templateUrl: "table-row-option-menu.component.html",
})
export class TableRowOptionMenuComponent {
  @Input() rowIndex = 0;
}
