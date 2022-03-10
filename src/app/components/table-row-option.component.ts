import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-table-row-option",
  templateUrl: "table-row-option.component.html",
})
export class TableRowOptionComponent {
  @Output() onClick = new EventEmitter();
  @Input() bwIcon: string = null;
}
