import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";

import { CiphersComponent as BaseCiphersComponent } from "jslib-angular/components/ciphers.component";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { TokenService } from "jslib-common/abstractions/token.service";
import { TotpService } from "jslib-common/abstractions/totp.service";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import { CipherType } from "jslib-common/enums/cipherType";
import { EventType } from "jslib-common/enums/eventType";
import { Organization } from "jslib-common/models/domain/organization";
import { CipherView } from "jslib-common/models/view/cipherView";

const MaxCheckedCount = 500;

@Component({
  selector: "app-vault-ciphers",
  templateUrl: "ciphers.component.html",
})
export class CiphersComponent extends BaseCiphersComponent implements OnDestroy {
  @Input() showAddNew = true;
  @Output() onAttachmentsClicked = new EventEmitter<CipherView>();
  @Output() onShareClicked = new EventEmitter<CipherView>();
  @Output() onCollectionsClicked = new EventEmitter<CipherView>();
  @Output() onCloneClicked = new EventEmitter<CipherView>();
  @Output() onOrganzationBadgeClicked = new EventEmitter<string>();

  pagedCiphers: CipherView[] = [];
  pageSize = 200;
  cipherType = CipherType;
  actionPromise: Promise<any>;
  userHasPremiumAccess = false;
  organizations: Organization[] = [];
  profileName: string;

  private didScroll = false;
  private pagedCiphersCount = 0;
  private refreshing = false;

  constructor(
    searchService: SearchService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected cipherService: CipherService,
    protected eventService: EventService,
    protected totpService: TotpService,
    protected stateService: StateService,
    protected passwordRepromptService: PasswordRepromptService,
    private logService: LogService,
    private organizationService: OrganizationService,
    private tokenService: TokenService
  ) {
    super(searchService);
  }

  ngOnDestroy() {
    this.selectAll(false);
  }

  // load() is called after the page loads and the first sync has completed.
  // Do not use ngOnInit() for anything that requires sync data.
  async load(filter: (cipher: CipherView) => boolean = null, deleted = false) {
    await super.load(filter, deleted);
    this.profileName = await this.tokenService.getName();
    this.organizations = await this.organizationService.getAll();
    this.userHasPremiumAccess = await this.stateService.getCanAccessPremium();
  }

  loadMore() {
    if (this.ciphers.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedCiphers.length;
    let pagedSize = this.pageSize;
    if (this.refreshing && pagedLength === 0 && this.pagedCiphersCount > this.pageSize) {
      pagedSize = this.pagedCiphersCount;
    }
    if (this.ciphers.length > pagedLength) {
      this.pagedCiphers = this.pagedCiphers.concat(
        this.ciphers.slice(pagedLength, pagedLength + pagedSize)
      );
    }
    this.pagedCiphersCount = this.pagedCiphers.length;
    this.didScroll = this.pagedCiphers.length > this.pageSize;
  }

  async refresh() {
    try {
      this.refreshing = true;
      await this.reload(this.filter, this.deleted);
    } finally {
      this.refreshing = false;
    }
  }

  isPaging() {
    const searching = this.isSearching();
    if (searching && this.didScroll) {
      this.resetPaging();
    }
    return !searching && this.ciphers.length > this.pageSize;
  }

  async resetPaging() {
    this.pagedCiphers = [];
    this.loadMore();
  }

  async doSearch(indexedCiphers?: CipherView[]) {
    this.ciphers = await this.searchService.searchCiphers(
      this.searchText,
      [this.filter, this.deletedFilter],
      indexedCiphers
    );
    this.resetPaging();
  }

  launch(uri: string) {
    this.platformUtilsService.launchUri(uri);
  }

  async attachments(c: CipherView) {
    if (!(await this.repromptCipher(c))) {
      return;
    }
    this.onAttachmentsClicked.emit(c);
  }

  async share(c: CipherView) {
    if (!(await this.repromptCipher(c))) {
      return;
    }
    this.onShareClicked.emit(c);
  }

  collections(c: CipherView) {
    this.onCollectionsClicked.emit(c);
  }

  async clone(c: CipherView) {
    if (!(await this.repromptCipher(c))) {
      return;
    }
    this.onCloneClicked.emit(c);
  }

  async delete(c: CipherView): Promise<boolean> {
    if (!(await this.repromptCipher(c))) {
      return;
    }
    if (this.actionPromise != null) {
      return;
    }
    const permanent = c.isDeleted;
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t(
        permanent ? "permanentlyDeleteItemConfirmation" : "deleteItemConfirmation"
      ),
      this.i18nService.t(permanent ? "permanentlyDeleteItem" : "deleteItem"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.deleteCipher(c.id, permanent);
      await this.actionPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(permanent ? "permanentlyDeletedItem" : "deletedItem")
      );
      this.refresh();
    } catch (e) {
      this.logService.error(e);
    }
    this.actionPromise = null;
  }

  async restore(c: CipherView): Promise<boolean> {
    if (this.actionPromise != null || !c.isDeleted) {
      return;
    }
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("restoreItemConfirmation"),
      this.i18nService.t("restoreItem"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.actionPromise = this.cipherService.restoreWithServer(c.id);
      await this.actionPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("restoredItem"));
      this.refresh();
    } catch (e) {
      this.logService.error(e);
    }
    this.actionPromise = null;
  }

  async copy(cipher: CipherView, value: string, typeI18nKey: string, aType: string) {
    if (
      this.passwordRepromptService.protectedFields().includes(aType) &&
      !(await this.repromptCipher(cipher))
    ) {
      return;
    }

    if (value == null || (aType === "TOTP" && !this.displayTotpCopyButton(cipher))) {
      return;
    } else if (value === cipher.login.totp) {
      value = await this.totpService.getCode(value);
    }

    if (!cipher.viewPassword) {
      return;
    }

    this.platformUtilsService.copyToClipboard(value, { window: window });
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t(typeI18nKey))
    );

    if (typeI18nKey === "password" || typeI18nKey === "verificationCodeTotp") {
      this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, cipher.id);
    } else if (typeI18nKey === "securityCode") {
      this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
    }
  }

  selectAll(select: boolean) {
    if (select) {
      this.selectAll(false);
    }
    const selectCount =
      select && this.ciphers.length > MaxCheckedCount ? MaxCheckedCount : this.ciphers.length;
    for (let i = 0; i < selectCount; i++) {
      this.checkCipher(this.ciphers[i], select);
    }
  }

  checkCipher(c: CipherView, select?: boolean) {
    (c as any).checked = select == null ? !(c as any).checked : select;
  }

  getSelected(): CipherView[] {
    if (this.ciphers == null) {
      return [];
    }
    return this.ciphers.filter((c) => !!(c as any).checked);
  }

  getSelectedIds(): string[] {
    return this.getSelected().map((c) => c.id);
  }

  displayTotpCopyButton(cipher: CipherView) {
    return (
      (cipher?.login?.hasTotp ?? false) && (cipher.organizationUseTotp || this.userHasPremiumAccess)
    );
  }

  async selectCipher(cipher: CipherView) {
    if (await this.repromptCipher(cipher)) {
      super.selectCipher(cipher);
    }
  }

  onOrganizationClicked(organizationId: string) {
    this.onOrganzationBadgeClicked.emit(organizationId);
  }

  protected deleteCipher(id: string, permanent: boolean) {
    return permanent
      ? this.cipherService.deleteWithServer(id)
      : this.cipherService.softDeleteWithServer(id);
  }

  protected showFixOldAttachments(c: CipherView) {
    return c.hasOldAttachments && c.organizationId == null;
  }

  protected async repromptCipher(c: CipherView) {
    return (
      c.reprompt === CipherRepromptType.None ||
      (await this.passwordRepromptService.showPasswordPrompt())
    );
  }
}
