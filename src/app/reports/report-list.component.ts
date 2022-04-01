import { Component } from "@angular/core";

import { ReportTypes } from "./report-card.component";

@Component({
  selector: "app-report-list",
  templateUrl: "report-list.component.html",
})
export class ReportListComponent {
  reports = [
    ReportTypes.exposedPasswords,
    ReportTypes.reusedPasswords,
    ReportTypes.weakPasswords,
    ReportTypes.unsecuredWebsites,
    ReportTypes.inactive2fa,
    ReportTypes.dataBreach,
  ];
}
