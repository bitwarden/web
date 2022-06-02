import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { UserNamePipe } from "jslib-angular/pipes/user-name.pipe";
import { ApiService } from "jslib-common/abstractions/api.service";
import { ExportService } from "jslib-common/abstractions/export.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { ProviderService } from "jslib-common/abstractions/provider.service";
import { Organization } from "jslib-common/models/domain/organization";
import { EventResponse } from "jslib-common/models/response/eventResponse";

import { BaseEventsComponent } from "../../common/base.events.component";
import { EventService } from "../../services/event.service";

@Component({
  selector: "app-org-events",
  templateUrl: "events.component.html",
})
export class EventsComponent extends BaseEventsComponent implements OnInit {
  exportFileName = "org-events";
  organizationId: string;
  organization: Organization;

  private orgUsersUserIdMap = new Map<string, any>();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    eventService: EventService,
    i18nService: I18nService,
    exportService: ExportService,
    platformUtilsService: PlatformUtilsService,
    private router: Router,
    logService: LogService,
    private userNamePipe: UserNamePipe,
    private organizationService: OrganizationService,
    private providerService: ProviderService
  ) {
    super(eventService, i18nService, exportService, platformUtilsService, logService);
  }

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      this.organization = await this.organizationService.get(this.organizationId);
      if (this.organization == null || !this.organization.useEvents) {
        this.router.navigate(["/organizations", this.organizationId]);
        return;
      }

      await this.load();
    });
  }

  async load() {
    const response = await this.apiService.getOrganizationUsers(this.organizationId);
    response.data.forEach((u) => {
      const name = this.userNamePipe.transform(u);
      this.orgUsersUserIdMap.set(u.userId, { name: name, email: u.email });
    });

    if (this.organization.providerId != null) {
      try {
        const provider = await this.providerService.get(this.organization.providerId);
        if (
          provider != null &&
          (await this.providerService.get(this.organization.providerId)).canManageUsers
        ) {
          const providerUsersResponse = await this.apiService.getProviderUsers(
            this.organization.providerId
          );
          providerUsersResponse.data.forEach((u) => {
            const name = this.userNamePipe.transform(u);
            this.orgUsersUserIdMap.set(u.userId, {
              name: `${name} (${this.organization.providerName})`,
              email: u.email,
            });
          });
        }
      } catch (e) {
        this.logService.warning(e);
      }
    }

    await this.loadEvents(true);
    this.loaded = true;
  }

  protected requestEvents(startDate: string, endDate: string, continuationToken: string) {
    return this.apiService.getEventsOrganization(
      this.organizationId,
      startDate,
      endDate,
      continuationToken
    );
  }

  protected getUserName(r: EventResponse, userId: string) {
    if (userId == null) {
      return null;
    }

    if (this.orgUsersUserIdMap.has(userId)) {
      return this.orgUsersUserIdMap.get(userId);
    }

    if (r.providerId != null && r.providerId === this.organization.providerId) {
      return {
        name: this.organization.providerName,
      };
    }

    return null;
  }
}
