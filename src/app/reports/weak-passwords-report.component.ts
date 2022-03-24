import { Component, OnInit } from "@angular/core";

import { ModalService } from "jslib-angular/services/modal.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { CipherType } from "jslib-common/enums/cipherType";
import { CipherView } from "jslib-common/models/view/cipherView";

import { CipherReportComponent } from "./cipher-report.component";

@Component({
  selector: "app-weak-passwords-report",
  templateUrl: "weak-passwords-report.component.html",
})
export class WeakPasswordsReportComponent extends CipherReportComponent implements OnInit {
  passwordStrengthMap = new Map<string, [string, string]>();

  private passwordStrengthCache = new Map<string, number>();

  constructor(
    protected cipherService: CipherService,
    protected passwordGenerationService: PasswordGenerationService,
    modalService: ModalService,
    messagingService: MessagingService,
    stateService: StateService,
    passwordRepromptService: PasswordRepromptService
  ) {
    super(modalService, messagingService, true, stateService, passwordRepromptService);
  }

  async ngOnInit() {
    if (await this.checkAccess()) {
      await super.load();
    }
  }

  async setCiphers() {
    const allCiphers = await this.getAllCiphers();
    const weakPasswordCiphers: CipherView[] = [];
    const isUserNameNotEmpty = (c: CipherView): boolean => {
      return c.login.username != null && c.login.username.trim() !== "";
    };
    const getCacheKey = (c: CipherView): string => {
      return c.login.password + "_____" + (isUserNameNotEmpty(c) ? c.login.username : "");
    };

    allCiphers.forEach((c) => {
      if (
        c.type !== CipherType.Login ||
        c.login.password == null ||
        c.login.password === "" ||
        c.isDeleted
      ) {
        return;
      }
      const hasUserName = isUserNameNotEmpty(c);
      const cacheKey = getCacheKey(c);
      if (!this.passwordStrengthCache.has(cacheKey)) {
        let userInput: string[] = [];
        if (hasUserName) {
          const atPosition = c.login.username.indexOf("@");
          if (atPosition > -1) {
            userInput = userInput
              .concat(
                c.login.username
                  .substr(0, atPosition)
                  .trim()
                  .toLowerCase()
                  .split(/[^A-Za-z0-9]/)
              )
              .filter((i) => i.length >= 3);
          } else {
            userInput = c.login.username
              .trim()
              .toLowerCase()
              .split(/[^A-Za-z0-9]/)
              .filter((i) => i.length >= 3);
          }
        }
        const result = this.passwordGenerationService.passwordStrength(
          c.login.password,
          userInput.length > 0 ? userInput : null
        );
        this.passwordStrengthCache.set(cacheKey, result.score);
      }
      const score = this.passwordStrengthCache.get(cacheKey);
      if (score != null && score <= 2) {
        this.passwordStrengthMap.set(c.id, this.scoreKey(score));
        weakPasswordCiphers.push(c);
      }
    });
    weakPasswordCiphers.sort((a, b) => {
      return (
        this.passwordStrengthCache.get(getCacheKey(a)) -
        this.passwordStrengthCache.get(getCacheKey(b))
      );
    });
    this.ciphers = weakPasswordCiphers;
  }

  protected getAllCiphers(): Promise<CipherView[]> {
    return this.cipherService.getAllDecrypted();
  }

  protected canManageCipher(c: CipherView): boolean {
    // this will only ever be false from the org view;
    return true;
  }

  private scoreKey(score: number): [string, string] {
    switch (score) {
      case 4:
        return ["strong", "success"];
      case 3:
        return ["good", "primary"];
      case 2:
        return ["weak", "warning"];
      default:
        return ["veryWeak", "danger"];
    }
  }
}
