import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-input-text[control][label][controlId]",
  templateUrl: "input-text.component.html",
})
export class InputTextComponent implements OnInit {
  @Input() control: FormControl;
  @Input() label: string;
  @Input() controlId: string;
  @Input() helperText: string;
  @Input() controlRequired: boolean = false;
  @Input() stripSpaces: boolean = false;

  get describedById() {
    return this.showDescribedBy ? this.controlId + "Desc" : null;
  }

  get showDescribedBy() {
    return this.helperText != null || this.control.hasError("required");
  }

  ngOnInit() {
    if (this.stripSpaces) {
      this.control.valueChanges.subscribe((value: string) =>
        this.control.setValue(this.doStripSpaces(value))
      );
    }
  }

  private doStripSpaces(value: string) {
    return value.replace(/ /g, "");
  }
}
