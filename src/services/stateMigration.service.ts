import { Inject, Injectable } from "@angular/core";

import { SECURE_STORAGE, STATE_FACTORY } from "jslib-angular/services/jslib-services.module";
import { StorageService } from "jslib-common/abstractions/storage.service";
import { StateFactory } from "jslib-common/factories/stateFactory";
import { StateMigrationService as BaseStateMigrationService } from "jslib-common/services/stateMigration.service";

import { Account } from "../models/account";
import { GlobalState } from "../models/globalState";

@Injectable()
export class StateMigrationService extends BaseStateMigrationService<GlobalState, Account> {
  constructor(
    storageService: StorageService,
    @Inject(SECURE_STORAGE) secureStorageService: StorageService,
    @Inject(STATE_FACTORY) stateFactory: StateFactory<GlobalState, Account>
  ) {
    super(storageService, secureStorageService, stateFactory);
  }

  protected async migrationStateFrom1To2(): Promise<void> {
    await super.migrateStateFrom1To2();
    const globals = (await this.get<GlobalState>("global")) ?? this.stateFactory.createGlobal(null);
    globals.rememberEmail = (await this.get<boolean>("rememberEmail")) ?? globals.rememberEmail;
    await this.set("global", globals);
  }
}
