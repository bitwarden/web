import { Component } from "@angular/core";

type ReportEntry = {
  title: string;
  description: string;
  image: string;
  route: string;
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
      image: "exposed-passwords.svg",
      route: "exposed-passwords-report",
    },
    {
      title: "reusedPasswordsReport",
      description: "reusedPasswordsReportDesc",
      image: "reused-passwords.svg",
      route: "reused-passwords-report",
    },
    {
      title: "weakPasswordsReport",
      description: "weakPasswordsReportDesc",
      image: "weak-passwords.svg",
      route: "weak-passwords-report",
    },
    {
      title: "unsecuredWebsitesReport",
      description: "unsecuredWebsitesReportDesc",
      image: "unsecure-websites.svg",
      route: "unsecured-websites-report",
    },
    {
      title: "inactive2faReport",
      description: "inactive2faReportDesc",
      image: "inactive-2fa.svg",
      route: "inactive-two-factor-report",
    },
    {
      title: "dataBreachReport",
      description: "breachDesc",
      image: "data-breach.svg",
      route: "breach-report",
    },
  ];
}
