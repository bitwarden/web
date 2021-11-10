import { Component } from '@angular/core';

import { BaseAcceptComponent } from 'src/app/common/base.accept.component';

@Component({
    selector: 'app-families-for-enterprise-setup-login',
    templateUrl: 'families-for-enterprise-setup-login.component.html',
})
export class FamiliesForEnterpriseSetupLoginComponent extends BaseAcceptComponent {

    failedShortMessage = 'sponsoredFamiliesAcceptFailedShort';
    failedMessage = 'sponsoredFamiliesAcceptFailed';

    requiredParameters = ['token'];

    async authedHandler(qParams: any) {
        this.router.navigate(['/setup/families-for-enterprise'], { queryParams: qParams });
    }

    // tslint:disable-next-line
    async unauthedHandler(qParams: any) { }
}
