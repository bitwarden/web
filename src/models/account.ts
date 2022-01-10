import {
  Account as BaseAccount,
  AccountSettings as BaseAccountSettings,
} from "jslib-common/models/domain/account";

export class AccountSettings extends BaseAccountSettings {
  vaultTimeout: number = process.env.NODE_ENV === "development" ? null : 15;
}

export class Account extends BaseAccount {
  settings?: AccountSettings = new AccountSettings();

  constructor(init: Partial<Account>) {
    super(init);
    Object.assign(this.settings, {
      ...new AccountSettings(),
      ...this.settings,
    });
  }
}
