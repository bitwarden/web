import { Component } from '@angular/core';

import { OrganizationUserUserDetailsResponse } from 'jslib/models/response/organizationUserResponse';

type BulkStatusEntry = {
    user: OrganizationUserUserDetailsResponse,
    error: boolean,
    message: string,
};

@Component({
    selector: 'app-bulk-status',
    templateUrl: 'bulk-status.component.html',
})
export class BulkStatusComponent {

    users: BulkStatusEntry[];

}
