import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { OrganizationUserType } from "jslib-common/enums/organizationUserType";
import { PermissionsApi } from "jslib-common/models/api/permissionsApi";
import { CollectionData } from "jslib-common/models/data/collectionData";
import { Collection } from "jslib-common/models/domain/collection";
import { OrganizationUserInviteRequest } from "jslib-common/models/request/organizationUserInviteRequest";
import { OrganizationUserUpdateRequest } from "jslib-common/models/request/organizationUserUpdateRequest";
import { SelectionReadOnlyRequest } from "jslib-common/models/request/selectionReadOnlyRequest";
import { CollectionDetailsResponse } from "jslib-common/models/response/collectionResponse";
import { CollectionView } from "jslib-common/models/view/collectionView";

@Component({
  selector: "app-user-add-edit",
  templateUrl: "user-add-edit.component.html",
})
export class UserAddEditComponent implements OnInit {
  @Input() name: string;
  @Input() organizationUserId: string;
  @Input() organizationId: string;
  @Input() usesKeyConnector = false;
  @Output() onSavedUser = new EventEmitter();
  @Output() onDeletedUser = new EventEmitter();

  loading = true;
  editMode = false;
  title: string;
  emails: string;
  type: OrganizationUserType = OrganizationUserType.User;
  permissions = new PermissionsApi();
  showCustom = false;
  access: "all" | "selected" = "selected";
  collections: CollectionView[] = [];
  formPromise: Promise<any>;
  deletePromise: Promise<any>;
  organizationUserType = OrganizationUserType;

  manageAllCollectionsCheckboxes = [
    {
      id: "createNewCollections",
      get: () => this.permissions.createNewCollections,
      set: (v: boolean) => (this.permissions.createNewCollections = v),
    },
    {
      id: "editAnyCollection",
      get: () => this.permissions.editAnyCollection,
      set: (v: boolean) => (this.permissions.editAnyCollection = v),
    },
    {
      id: "deleteAnyCollection",
      get: () => this.permissions.deleteAnyCollection,
      set: (v: boolean) => (this.permissions.deleteAnyCollection = v),
    },
  ];

  manageAssignedCollectionsCheckboxes = [
    {
      id: "editAssignedCollections",
      get: () => this.permissions.editAssignedCollections,
      set: (v: boolean) => (this.permissions.editAssignedCollections = v),
    },
    {
      id: "deleteAssignedCollections",
      get: () => this.permissions.deleteAssignedCollections,
      set: (v: boolean) => (this.permissions.deleteAssignedCollections = v),
    },
  ];

  get customUserTypeSelected(): boolean {
    return this.type === OrganizationUserType.Custom;
  }

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private collectionService: CollectionService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.editMode = this.loading = this.organizationUserId != null;
    await this.loadCollections();

    if (this.editMode) {
      this.editMode = true;
      this.title = this.i18nService.t("editUser");
      try {
        const user = await this.apiService.getOrganizationUser(
          this.organizationId,
          this.organizationUserId
        );
        this.access = user.accessAll ? "all" : "selected";
        this.type = user.type;
        if (user.type === OrganizationUserType.Custom) {
          this.permissions = user.permissions;
        }
        if (user.collections != null && this.collections != null) {
          user.collections.forEach((s) => {
            const collection = this.collections.filter((c) => c.id === s.id);
            if (collection != null && collection.length > 0) {
              (collection[0] as any).checked = true;
              collection[0].readOnly = s.readOnly;
              collection[0].hidePasswords = s.hidePasswords;
            }
          });
        }
      } catch (e) {
        this.logService.error(e);
      }
    } else {
      this.title = this.i18nService.t("inviteUser");
    }

    this.loading = false;
  }

  async loadCollections() {
    const response = await this.apiService.getCollections(this.organizationId);
    const collections = response.data.map(
      (r) => new Collection(new CollectionData(r as CollectionDetailsResponse))
    );
    this.collections = await this.collectionService.decryptMany(collections);
  }

  check(c: CollectionView, select?: boolean) {
    (c as any).checked = select == null ? !(c as any).checked : select;
    if (!(c as any).checked) {
      c.readOnly = false;
    }
  }

  selectAll(select: boolean) {
    this.collections.forEach((c) => this.check(c, select));
  }

  setRequestPermissions(p: PermissionsApi, clearPermissions: boolean) {
    Object.assign(p, clearPermissions ? new PermissionsApi() : this.permissions);
    return p;
  }

  handleDependentPermissions() {
    // Manage Password Reset must have Manage Users enabled
    if (this.permissions.manageResetPassword && !this.permissions.manageUsers) {
      this.permissions.manageUsers = true;
      (document.getElementById("manageUsers") as HTMLInputElement).checked = true;
      this.platformUtilsService.showToast(
        "info",
        null,
        this.i18nService.t("resetPasswordManageUsers")
      );
    }
  }

  async submit() {
    let collections: SelectionReadOnlyRequest[] = null;
    if (this.access !== "all") {
      collections = this.collections
        .filter((c) => (c as any).checked)
        .map((c) => new SelectionReadOnlyRequest(c.id, !!c.readOnly, !!c.hidePasswords));
    }

    try {
      if (this.editMode) {
        const request = new OrganizationUserUpdateRequest();
        request.accessAll = this.access === "all";
        request.type = this.type;
        request.collections = collections;
        request.permissions = this.setRequestPermissions(
          request.permissions ?? new PermissionsApi(),
          request.type !== OrganizationUserType.Custom
        );
        this.formPromise = this.apiService.putOrganizationUser(
          this.organizationId,
          this.organizationUserId,
          request
        );
      } else {
        const request = new OrganizationUserInviteRequest();
        request.emails = this.emails.trim().split(/\s*,\s*/);
        request.accessAll = this.access === "all";
        request.type = this.type;
        request.permissions = this.setRequestPermissions(
          request.permissions ?? new PermissionsApi(),
          request.type !== OrganizationUserType.Custom
        );
        request.collections = collections;
        this.formPromise = this.apiService.postOrganizationUserInvite(this.organizationId, request);
      }
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.editMode ? "editedUserId" : "invitedUsers", this.name)
      );
      this.onSavedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }

  async delete() {
    if (!this.editMode) {
      return;
    }

    const message = this.usesKeyConnector
      ? "removeUserConfirmationKeyConnector"
      : "removeUserConfirmation";
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t(message),
      this.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      this.deletePromise = this.apiService.deleteOrganizationUser(
        this.organizationId,
        this.organizationUserId
      );
      await this.deletePromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("removedUserId", this.name)
      );
      this.onDeletedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
