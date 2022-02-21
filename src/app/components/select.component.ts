import { Component, Input, Self } from "@angular/core";
import { FormControl, NgControl, Validators } from "@angular/forms";
import { dirtyRequired } from "jslib-angular/validators/dirty.validator";

import { ISelectOptions } from "jslib-angular/interfaces/ISelectOptions";

@Component({
  selector: "app-select",
  templateUrl: "select.component.html",
})
export class SelectComponent {
  get isRequired() {
    return (
      this.controlDir.control.hasValidator(Validators.required) ||
      this.controlDir.control.hasValidator(dirtyRequired)
    );
  }

  @Input() label: string;
  @Input() controlId: string;
  @Input() selectOptions: ISelectOptions[];

  internalControl = new FormControl("");

  private onChange: any;
  private onTouched: any;

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  ngOnInit() {
    this.internalControl.valueChanges.subscribe((value: string) => this.onChange(value));
  }

  onBlur() {
    this.onTouched();
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
