import { Component, Input, Self } from "@angular/core";
import { FormControl, NgControl, Validators } from "@angular/forms";

import { dirtyRequired } from "jslib-angular/validators/dirty.validator";

@Component({
  selector: "app-input-checkbox",
  templateUrl: "input-checkbox.component.html",
})
export class InputCheckboxComponent {
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

  internalControl = new FormControl("");

  private onChange: any;
  private onTouched: any;

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  ngOnInit() {
    this.internalControl.valueChanges.subscribe((value: string) => this.onChange(value));
  }

  // CVA interfaces
  writeValue(value: string) {
    this.internalControl.setValue(value);
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
}
