import { Component } from "@angular/core";

type ReportEntry = {
  title: string;
  description: string;
};

@Component({
  selector: "app-report-list",
  templateUrl: "report-list.component.html",
})
export class ReportListComponent {
  reports: ReportEntry[] = [
    {
      title: "exposedPasswordsReport",
      description: "exposedPasswordsReportDesc",
    },
    {
      title: "reusedPasswordsReport",
      description: "reusedPasswordsReportDesc",
    },
    {
      title: "weakPasswordsReport",
      description: "weakPasswordsReportDesc",
    },
    {
      title: "unsecuredWebsitesReport",
      description: "unsecuredWebsitesReportDesc",
    },
    {
      title: "inactive2faReport",
      description: "inactive2faReportDesc",
    },
    {
      title: "dataBreachReport",
      description: "breachDesc",
    },
  ];
}
