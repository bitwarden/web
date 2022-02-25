import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { Utils } from "jslib-common/misc/utils";
import { OrganizationUserUpdateGroupsRequest } from "jslib-common/models/request/organizationUserUpdateGroupsRequest";
import { GroupResponse } from "jslib-common/models/response/groupResponse";

@Component({
  selector: "app-user-groups",
  templateUrl: "user-groups.component.html",
})
export class UserGroupsComponent implements OnInit {
  @Input() name: string;
  @Input() organizationUserId: string;
  @Input() organizationId: string;
  @Output() onSavedUser = new EventEmitter();

  loading = true;
  groups: GroupResponse[] = [];
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    const groupsResponse = await this.apiService.getGroups(this.organizationId);
    const groups = groupsResponse.data.map((r) => r);
    groups.sort(Utils.getSortFunction(this.i18nService, "name"));
    this.groups = groups;

    try {
      const userGroups = await this.apiService.getOrganizationUserGroups(
        this.organizationId,
        this.organizationUserId
      );
      if (userGroups != null && this.groups != null) {
        userGroups.forEach((ug) => {
          const group = this.groups.filter((g) => g.id === ug);
          if (group != null && group.length > 0) {
            (group[0] as any).checked = true;
          }
        });
      }
    } catch (e) {
      this.logService.error(e);
    }

    this.loading = false;
  }

  check(g: GroupResponse, select?: boolean) {
    (g as any).checked = select == null ? !(g as any).checked : select;
    if (!(g as any).checked) {
      (g as any).readOnly = false;
    }
  }

  selectAll(select: boolean) {
    this.groups.forEach((g) => this.check(g, select));
  }

  async submit() {
    const request = new OrganizationUserUpdateGroupsRequest();
    request.groupIds = this.groups.filter((g) => (g as any).checked).map((g) => g.id);

    try {
      this.formPromise = this.apiService.putOrganizationUserGroups(
        this.organizationId,
        this.organizationUserId,
        request
      );
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("editedGroupsForUser", this.name)
      );
      this.onSavedUser.emit();
    } catch (e) {
      this.logService.error(e);
    }
  }
}
