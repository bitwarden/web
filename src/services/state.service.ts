import { StateService as BaseStateService } from "jslib-common/services/state.service";

import { Account } from "../models/account";
import { GlobalState } from "../models/globalState";

import { StateService as StateServiceAbstraction } from "../abstractions/state.service";

import { StorageOptions } from "jslib-common/models/domain/storageOptions";

export class StateService
  extends BaseStateService<GlobalState, Account>
  implements StateServiceAbstraction
{
  async addAccount(account: Account) {
    // Apply web overides to default account values
    account = new Account(account);
    await super.addAccount(account);
  }

  async getRememberEmail(options?: StorageOptions) {
    return (
      await this.getGlobals(this.reconcileOptions(options, await this.defaultOnDiskLocalOptions()))
    )?.rememberEmail;
  }

  async setRememberEmail(value: boolean, options?: StorageOptions): Promise<void> {
    const globals = await this.getGlobals(
      this.reconcileOptions(options, await this.defaultOnDiskLocalOptions())
    );
    globals.rememberEmail = value;
    await this.saveGlobals(
      globals,
      this.reconcileOptions(options, await this.defaultOnDiskLocalOptions())
    );
  }
}
