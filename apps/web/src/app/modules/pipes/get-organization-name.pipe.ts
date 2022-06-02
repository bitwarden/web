import { Pipe, PipeTransform } from "@angular/core";

import { Organization } from "jslib-common/models/domain/organization";

@Pipe({
  name: "orgNameFromId",
  pure: true,
})
export class GetOrgNameFromIdPipe implements PipeTransform {
  transform(value: string, organizations: Organization[]) {
    const orgName = organizations.find((o) => o.id === value)?.name;
    return orgName;
  }
}
