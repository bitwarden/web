import { Component } from '@angular/core';

import { ProviderUserUserDetailsResponse } from 'jslib-common/models/response/provider/providerUserResponse';

type BulkStatusEntry = {
    user: ProviderUserUserDetailsResponse,
    error: boolean,
    message: string,
};

@Component({
    selector: 'app-bulk-status',
    templateUrl: 'bulk-status.component.html',
})
export class BulkStatusComponent {

    users: BulkStatusEntry[];
    loading: boolean = false;

}
