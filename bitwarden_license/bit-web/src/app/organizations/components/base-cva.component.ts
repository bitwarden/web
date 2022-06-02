import { Directive, Input, OnInit, Self } from "@angular/core";
import { ControlValueAccessor, FormControl, NgControl, Validators } from "@angular/forms";

import { dirtyRequired } from "jslib-angular/validators/dirty.validator";

/** For use in the SSO Config Form only - will be deprecated by the Component Library */
@Directive()
export abstract class BaseCvaComponent implements ControlValueAccessor, OnInit {
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

  protected onChange: any;
  protected onTouched: any;

  constructor(@Self() public controlDir: NgControl) {
    this.controlDir.valueAccessor = this;
  }

  ngOnInit() {
    this.internalControl.valueChanges.subscribe(this.onValueChangesInternal);
  }

  onBlurInternal() {
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

  protected onValueChangesInternal: any = (value: string) => this.onChange(value);
  // End CVA interfaces
}
