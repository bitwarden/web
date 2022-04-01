import { CipherData } from "jslib-common/models/data/cipherData";
import { CollectionData } from "jslib-common/models/data/collectionData";
import { FolderData } from "jslib-common/models/data/folderData";
import { SendData } from "jslib-common/models/data/sendData";
import { StorageOptions } from "jslib-common/models/domain/storageOptions";
import { StateService as BaseStateService } from "jslib-common/services/state.service";

import { StateService as StateServiceAbstraction } from "../abstractions/state.service";
import { Account } from "../models/account";
import { GlobalState } from "../models/globalState";

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

  async getEncryptedCiphers(options?: StorageOptions): Promise<{ [id: string]: CipherData }> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.getEncryptedCiphers(options);
  }

  async setEncryptedCiphers(
    value: { [id: string]: CipherData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.setEncryptedCiphers(value, options);
  }

  async getEncryptedCollections(
    options?: StorageOptions
  ): Promise<{ [id: string]: CollectionData }> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.getEncryptedCollections(options);
  }

  async setEncryptedCollections(
    value: { [id: string]: CollectionData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.setEncryptedCollections(value, options);
  }

  async getEncryptedFolders(options?: StorageOptions): Promise<{ [id: string]: FolderData }> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.getEncryptedFolders(options);
  }

  async setEncryptedFolders(
    value: { [id: string]: FolderData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.setEncryptedFolders(value, options);
  }

  async getEncryptedSends(options?: StorageOptions): Promise<{ [id: string]: SendData }> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.getEncryptedSends(options);
  }

  async setEncryptedSends(
    value: { [id: string]: SendData },
    options?: StorageOptions
  ): Promise<void> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.setEncryptedSends(value, options);
  }

  override async getLastSync(options?: StorageOptions): Promise<string> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.getLastSync(options);
  }

  override async setLastSync(value: string, options?: StorageOptions): Promise<void> {
    options = this.reconcileOptions(options, this.defaultInMemoryOptions);
    return await super.setLastSync(value, options);
  }
}
