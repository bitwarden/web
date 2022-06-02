import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { SearchPipe } from "jslib-angular/pipes/search.pipe";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { OrganizationUserStatusType } from "jslib-common/enums/organizationUserStatusType";
import { OrganizationUserType } from "jslib-common/enums/organizationUserType";
import { Utils } from "jslib-common/misc/utils";
import { SelectionReadOnlyRequest } from "jslib-common/models/request/selectionReadOnlyRequest";
import { OrganizationUserUserDetailsResponse } from "jslib-common/models/response/organizationUserResponse";

@Component({
  selector: "app-entity-users",
  templateUrl: "entity-users.component.html",
  providers: [SearchPipe],
})
export class EntityUsersComponent implements OnInit {
  @Input() entity: "group" | "collection";
  @Input() entityId: string;
  @Input() entityName: string;
  @Input() organizationId: string;
  @Output() onEditedUsers = new EventEmitter();

  organizationUserType = OrganizationUserType;
  organizationUserStatusType = OrganizationUserStatusType;

  showSelected = false;
  loading = true;
  formPromise: Promise<any>;
  selectedCount = 0;
  searchText: string;

  private allUsers: OrganizationUserUserDetailsResponse[] = [];

  constructor(
    private search: SearchPipe,
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    await this.loadUsers();
    this.loading = false;
  }

  get users() {
    if (this.showSelected) {
      return this.allUsers.filter((u) => (u as any).checked);
    } else {
      return this.allUsers;
    }
  }

  get searchedUsers() {
    return this.search.transform(this.users, this.searchText, "name", "email", "id");
  }

  get scrollViewportStyle() {
    return `min-height: 120px; height: ${120 + this.searchedUsers.length * 46}px`;
  }

  async loadUsers() {
    const users = await this.apiService.getOrganizationUsers(this.organizationId);
    this.allUsers = users.data.map((r) => r).sort(Utils.getSortFunction(this.i18nService, "email"));
    if (this.entity === "group") {
      const response = await this.apiService.getGroupUsers(this.organizationId, this.entityId);
      if (response != null && users.data.length > 0) {
        response.forEach((s) => {
          const user = users.data.filter((u) => u.id === s);
          if (user != null && user.length > 0) {
            (user[0] as any).checked = true;
          }
        });
      }
    } else if (this.entity === "collection") {
      const response = await this.apiService.getCollectionUsers(this.organizationId, this.entityId);
      if (response != null && users.data.length > 0) {
        response.forEach((s) => {
          const user = users.data.filter((u) => !u.accessAll && u.id === s.id);
          if (user != null && user.length > 0) {
            (user[0] as any).checked = true;
            (user[0] as any).readOnly = s.readOnly;
            (user[0] as any).hidePasswords = s.hidePasswords;
          }
        });
      }
    }

    this.allUsers.forEach((u) => {
      if (this.entity === "collection" && u.accessAll) {
        (u as any).checked = true;
      }
      if ((u as any).checked) {
        this.selectedCount++;
      }
    });
  }

  check(u: OrganizationUserUserDetailsResponse) {
    if (this.entity === "collection" && u.accessAll) {
      return;
    }
    (u as any).checked = !(u as any).checked;
    this.selectedChanged(u);
  }

  selectedChanged(u: OrganizationUserUserDetailsResponse) {
    if ((u as any).checked) {
      this.selectedCount++;
    } else {
      if (this.entity === "collection") {
        (u as any).readOnly = false;
        (u as any).hidePasswords = false;
      }
      this.selectedCount--;
    }
  }

  filterSelected(showSelected: boolean) {
    this.showSelected = showSelected;
  }

  async submit() {
    try {
      if (this.entity === "group") {
        const selections = this.users.filter((u) => (u as any).checked).map((u) => u.id);
        this.formPromise = this.apiService.putGroupUsers(
          this.organizationId,
          this.entityId,
          selections
        );
      } else {
        const selections = this.users
          .filter((u) => (u as any).checked && !u.accessAll)
          .map(
            (u) =>
              new SelectionReadOnlyRequest(u.id, !!(u as any).readOnly, !!(u as any).hidePasswords)
          );
        this.formPromise = this.apiService.putCollectionUsers(
          this.organizationId,
          this.entityId,
          selections
        );
      }
      await this.formPromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("updatedUsers"));
      this.onEditedUsers.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
