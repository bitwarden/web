import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PolicyType } from "jslib-common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class PasswordGeneratorPolicy extends BasePolicy {
  name = "passwordGenerator";
  description = "passwordGeneratorPolicyDesc";
  type = PolicyType.PasswordGenerator;
  component = PasswordGeneratorPolicyComponent;
}

@Component({
  selector: "policy-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    defaultType: [null],
    minLength: [null],
    useUpper: [null],
    useLower: [null],
    useNumbers: [null],
    useSpecial: [null],
    minNumbers: [null],
    minSpecial: [null],
    minNumberWords: [null],
    capitalize: [null],
    includeNumber: [null],
  });

  defaultTypes: { name: string; value: string }[];

  constructor(private formBuilder: FormBuilder, i18nService: I18nService) {
    super();

    this.defaultTypes = [
      { name: i18nService.t("userPreference"), value: null },
      { name: i18nService.t("password"), value: "password" },
      { name: i18nService.t("passphrase"), value: "passphrase" },
    ];
  }
}
