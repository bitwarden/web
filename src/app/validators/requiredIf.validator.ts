import {
    AbstractControl,
    ValidationErrors,
    Validators,
} from '@angular/forms';

export function requiredIf(dependentControlName: string, predicateFn: (ctrl: AbstractControl) => boolean) {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.parent == null) {
            return;
        }

        const dependentControl = control.parent.get(dependentControlName);
        return predicateFn(dependentControl)
            ? Validators.required(control)
            : null;
    }
}
