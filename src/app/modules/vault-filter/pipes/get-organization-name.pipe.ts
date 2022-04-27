import { Pipe, PipeTransform } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { Organization } from "jslib-common/models/domain/organization";

@Pipe({
  name: "orgNameFromId",
  pure: true,
})
export class GetOrgNameFromIdPipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(value: string, organizations: Organization[]) {
    let orgName = organizations.find((o) => o.id === value)?.name;
    if (orgName == null) {
      orgName = this.i18nService.t("me");
    }
    return orgName;
  }
}
