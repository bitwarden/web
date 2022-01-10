import { Component } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { PolicyType } from "jslib-common/enums/policyType";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class SendOptionsPolicy extends BasePolicy {
  name = "sendOptions";
  description = "sendOptionsPolicyDesc";
  type = PolicyType.SendOptions;
  component = SendOptionsPolicyComponent;
}

@Component({
  selector: "policy-send-options",
  templateUrl: "send-options.component.html",
})
export class SendOptionsPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    disableHideEmail: false,
  });

  constructor(private formBuilder: FormBuilder) {
    super();
  }
}
