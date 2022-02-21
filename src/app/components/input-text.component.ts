import { Component, Input, OnInit, Self } from "@angular/core";
import { ControlValueAccessor, FormControl, NgControl, Validators } from "@angular/forms";
import { dirtyRequired } from "jslib-angular/validators/dirty.validator";

@Component({
  selector: "app-input-text[label][controlId]",
  templateUrl: "input-text.component.html",
})
export class InputTextComponent implements ControlValueAccessor, OnInit {
  get describedById() {
    return this.showDescribedBy ? this.controlId + "Desc" : null;
  }

  get showDescribedBy() {
    return this.helperText != null || this.controlDir.control.hasError("required");
  }

  get isRequired() {
    return (
      this.controlDir.control.hasValidator(Validators.required) ||
      this.controlDir.control.hasValidator(dirtyRequired)
    );
  }

  @Input() label: string;
  @Input() controlId: string;
  @Input() helperText: string;
  @Input() helperTextSameAsError: string;
  @Input() requiredErrorMessage: string;
  @Input() stripSpaces: boolean = false;

  internalControl = new FormControl("");
  transformValue: (value: string) => string = null;

  private onChange: any;
  private onTouched: any;

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  ngOnInit() {
    if (this.stripSpaces) {
      this.transformValue = this.doStripSpaces;
    }

    this.internalControl.valueChanges.subscribe((value: string) => {
      let newValue = value;
      if (this.transformValue != null) {
        newValue = this.transformValue(value);
        this.internalControl.setValue(newValue, { emitEvent: false });
      }
      this.onChange(newValue);
    });
  }

  onBlur() {
    this.onTouched();
  }

  // CVA interfaces
  writeValue(value: string) {
    this.internalControl.setValue(value == null ? "" : value);
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.internalControl.disable();
    } else {
      this.internalControl.enable();
    }
  }
  // End CVA interfaces

  private doStripSpaces(value: string) {
    return value.replace(/ /g, "");
  }
}
