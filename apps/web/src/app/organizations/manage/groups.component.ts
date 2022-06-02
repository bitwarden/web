import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { SearchService } from "jslib-common/abstractions/search.service";
import { Utils } from "jslib-common/misc/utils";
import { GroupResponse } from "jslib-common/models/response/groupResponse";

import { EntityUsersComponent } from "../../modules/organizations/manage/entity-users.component";

import { GroupAddEditComponent } from "./group-add-edit.component";

@Component({
  selector: "app-org-groups",
  templateUrl: "groups.component.html",
})
export class GroupsComponent implements OnInit {
  @ViewChild("addEdit", { read: ViewContainerRef, static: true }) addEditModalRef: ViewContainerRef;
  @ViewChild("usersTemplate", { read: ViewContainerRef, static: true })
  usersModalRef: ViewContainerRef;

  loading = true;
  organizationId: string;
  groups: GroupResponse[];
  pagedGroups: GroupResponse[];
  searchText: string;

  protected didScroll = false;
  protected pageSize = 100;

  private pagedGroupsCount = 0;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private modalService: ModalService,
    private platformUtilsService: PlatformUtilsService,
    private router: Router,
    private searchService: SearchService,
    private logService: LogService,
    private organizationService: OrganizationService
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      const organization = await this.organizationService.get(this.organizationId);
      if (organization == null || !organization.useGroups) {
        this.router.navigate(["/organizations", this.organizationId]);
        return;
      }
      await this.load();
      this.route.queryParams.pipe(first()).subscribe(async (qParams) => {
        this.searchText = qParams.search;
      });
    });
  }

  async load() {
    const response = await this.apiService.getGroups(this.organizationId);
    const groups = response.data != null && response.data.length > 0 ? response.data : [];
    groups.sort(Utils.getSortFunction(this.i18nService, "name"));
    this.groups = groups;
    this.resetPaging();
    this.loading = false;
  }

  loadMore() {
    if (!this.groups || this.groups.length <= this.pageSize) {
      return;
    }
    const pagedLength = this.pagedGroups.length;
    let pagedSize = this.pageSize;
    if (pagedLength === 0 && this.pagedGroupsCount > this.pageSize) {
      pagedSize = this.pagedGroupsCount;
    }
    if (this.groups.length > pagedLength) {
      this.pagedGroups = this.pagedGroups.concat(
        this.groups.slice(pagedLength, pagedLength + pagedSize)
      );
    }
    this.pagedGroupsCount = this.pagedGroups.length;
    this.didScroll = this.pagedGroups.length > this.pageSize;
  }

  async edit(group: GroupResponse) {
    const [modal] = await this.modalService.openViewRef(
      GroupAddEditComponent,
      this.addEditModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.groupId = group != null ? group.id : null;
        comp.onSavedGroup.subscribe(() => {
          modal.close();
          this.load();
        });
        comp.onDeletedGroup.subscribe(() => {
          modal.close();
          this.removeGroup(group);
        });
      }
    );
  }

  add() {
    this.edit(null);
  }

  async delete(group: GroupResponse) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("deleteGroupConfirmation"),
      group.name,
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    try {
      await this.apiService.deleteGroup(this.organizationId, group.id);
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t("deletedGroupId", group.name)
      );
      this.removeGroup(group);
    } catch (e) {
      this.logService.error(e);
    }
  }

  async users(group: GroupResponse) {
    const [modal] = await this.modalService.openViewRef(
      EntityUsersComponent,
      this.usersModalRef,
      (comp) => {
        comp.organizationId = this.organizationId;
        comp.entity = "group";
        comp.entityId = group.id;
        comp.entityName = group.name;

        comp.onEditedUsers.subscribe(() => {
          modal.close();
        });
      }
    );
  }

  async resetPaging() {
    this.pagedGroups = [];
    this.loadMore();
  }

  isSearching() {
    return this.searchService.isSearchable(this.searchText);
  }

  isPaging() {
    const searching = this.isSearching();
    if (searching && this.didScroll) {
      this.resetPaging();
    }
    return !searching && this.groups && this.groups.length > this.pageSize;
  }

  private removeGroup(group: GroupResponse) {
    const index = this.groups.indexOf(group);
    if (index > -1) {
      this.groups.splice(index, 1);
      this.resetPaging();
    }
  }
}
