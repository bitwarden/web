import { Component, Input, OnInit, Self } from "@angular/core";

import { BaseCvaComponent } from "./base-cva.component";

@Component({
  selector: "app-input-text[label][controlId]",
  templateUrl: "input-text.component.html",
})
export class InputTextComponent extends BaseCvaComponent implements OnInit {
  @Input() helperTextSameAsError: string;
  @Input() requiredErrorMessage: string;
  @Input() stripSpaces: boolean = false;

  protected onValueChangesInternal: any = (value: string) => {
    let newValue = value;
    if (this.transformValue != null) {
      newValue = this.transformValue(value);
      this.internalControl.setValue(newValue, { emitEvent: false });
    }
  };

  transformValue: (value: string) => string = null;

  ngOnInit() {
    super.ngOnInit();
    if (this.stripSpaces) {
      this.transformValue = this.doStripSpaces;
    }
  }

  writeValue(value: string) {
    this.internalControl.setValue(value == null ? "" : value);
  }

  protected onValueChangeInternal(value: string) {
    let newValue = value;
    if (this.transformValue != null) {
      newValue = this.transformValue(value);
      this.internalControl.setValue(newValue, { emitEvent: false });
    }
  }

  private doStripSpaces(value: string) {
    return value.replace(/ /g, "");
  }
}
