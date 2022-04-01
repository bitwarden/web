import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { StateService } from "jslib-common/abstractions/state.service";

export enum ReportTypes {
  "exposedPasswords" = "exposedPasswords",
  "reusedPasswords" = "reusedPasswords",
  "weakPasswords" = "weakPasswords",
  "unsecuredWebsites" = "unsecuredWebsites",
  "inactive2fa" = "inactive2fa",
  "dataBreach" = "dataBreach",
}

type ReportEntry = {
  title: string;
  description: string;
  route: string;
  icon: string;
  requiresPremium: boolean;
};

const reports: Record<ReportTypes, ReportEntry> = {
  exposedPasswords: {
    title: "exposedPasswordsReport",
    description: "exposedPasswordsReportDesc",
    route: "exposed-passwords-report",
    icon: `
      <svg width="101" height="77" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M32.374 50.192a26.42 26.42 0 0 0 9.111 1.608c14.34 0 25.965-11.372 25.965-25.4 0-.337-.007-.673-.02-1.008h25.299v34.85H32.374v-10.05Z" fill="currentColor" />
        <path d="M15.805 26.4c0 14.028 11.625 25.4 25.965 25.4s25.964-11.372 25.964-25.4C67.734 12.372 56.11 1 41.77 1 27.43 1 15.805 12.372 15.805 26.4Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M27.914 47.849a1 1 0 0 0-2 0h2Zm68.288-26.792a2.12 2.12 0 0 1 2.14 2.11h2c0-2.253-1.83-4.11-4.14-4.11v2Zm2.14 2.11v40.552h2V23.167h-2Zm0 40.552c0 1.172-.958 2.11-2.14 2.11v2c2.25 0 4.14-1.798 4.14-4.11h-2Zm-2.14 2.11H30.054v2h66.148v-2Zm-66.148 0a2.12 2.12 0 0 1-2.14-2.11h-2a4.12 4.12 0 0 0 4.14 4.11v-2Zm-2.14-2.11V47.85h-2v15.87h2Zm39.254-42.662h29.034v-2H67.168v2Z" fill="#fff" />
        <path d="M67.203 25.56h25.64v34.85H32.487V50.011" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
        <path d="M47.343 76h31.571" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M57.557 66.83V76M67.771 66.83V76" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
        <path d="m20.995 42.873-3.972 3.972-14.61 14.61a3.413 3.413 0 0 0 0 4.826v0a3.413 3.413 0 0 0 4.827 0l14.61-14.61 3.972-3.972" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M86.037 32.488H71.845M86.037 37.81H76.28M71.845 37.81h-6.652M86.037 43.132h-6.209M74.95 43.132H61.2M86.037 48.454H71.845M66.967 48.454h-7.54M86.037 53.776H66.08M61.201 53.776h-11.53M44.793 53.776h-7.096" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        <rect width="40.801" height="9.757" rx="4" transform="matrix(-1 0 0 1 61.201 14.748)" stroke="#fff" stroke-width="2" />
        <path d="M16.852 33.375h28.375a4 4 0 0 1 4 4v1.757a4 4 0 0 1-4 4H22.174M66.523 33.375h-3.539a4 4 0 0 0-4 4v3.761c0 1.102.894 1.996 1.996 1.996v0" stroke="#fff" stroke-width="2" stroke-linecap="round" />
      </svg>
    `,
    requiresPremium: true,
  },
  reusedPasswords: {
    title: "reusedPasswordsReport",
    description: "reusedPasswordsReportDesc",
    route: "reused-passwords-report",
    icon: `
    <svg width="102" height="102" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M57.983 15.06a35.664 35.664 0 0 1 14.531 6.27c16.164 11.78 19.585 34.613 7.643 51a37.227 37.227 0 0 1-6.81 7.138m-32.842 6.697a35.708 35.708 0 0 1-11.239-5.495c-16.163-11.78-19.585-34.613-7.642-51a37.55 37.55 0 0 1 3.295-3.929" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M93.909 64.598H7.72c-.708 0-1.275-.662-1.275-1.49V40.273c0-.828.567-1.49 1.275-1.49H93.91c.708 0 1.275.663 1.275 1.49v22.837c.047.827-.567 1.49-1.275 1.49Z" fill="currentColor" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M21.532 52.186v-5.965M21.532 52.187l5.748-1.844M21.532 52.186l3.524 4.881M21.531 52.186l-3.47 4.881M21.532 52.187l-5.694-1.844M40.944 52.186v-5.965M40.944 52.187l5.694-1.844M40.944 52.187l3.525 4.88M40.944 52.187l-3.525 4.88M40.944 52.187l-5.694-1.844M54.849 57.337h11.294M74.21 57.337h11.295M41.75 83l.71 4.75-4.75.71M58.664 18.66 56 14.665 59.996 12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    `,
    requiresPremium: true,
  },
  weakPasswords: {
    title: "weakPasswordsReport",
    description: "weakPasswordsReportDesc",
    route: "weak-passwords-report",
    icon: `
      <svg width="78" height="78" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M66.493 64.415V77H9.979V64.324M9.979 44.065V32.106h56.514v12.148" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
        <path d="M75.44 64.852H2.085c-.603 0-1.085-.555-1.085-1.25V44.448c0-.694.482-1.25 1.085-1.25H75.44c.603 0 1.085.556 1.085 1.25v19.156c.04.694-.482 1.25-1.085 1.25Z" fill="currentColor" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M13.84 54.56v-5.077M13.84 54.56l4.893-1.57M13.84 54.56l3 4.153M13.84 54.56l-2.954 4.153M13.84 54.56l-4.846-1.57M30.363 54.56v-5.077M30.363 54.56l4.846-1.57M30.363 54.56l3 4.153M30.363 54.56l-3 4.153M30.363 54.56l-4.846-1.57M42.197 59.042h9.506M58.57 59.042h9.507" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M20.863 31.364c-.274-5.285 0-15.817 1.093-18.863 1.276-3.554 6.233-10.826 15.856-11.482 4.83-.273 15.2 2.296 18.043 14.763" stroke="#fff" stroke-width="2" />
      </svg>
    `,
    requiresPremium: true,
  },
  unsecuredWebsites: {
    title: "unsecuredWebsitesReport",
    description: "unsecuredWebsitesReportDesc",
    route: "unsecured-websites-report",
    icon: `
      <svg width="113" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.71 12.983h110.362v55.11a6 6 0 0 1-6 6H7.711a6 6 0 0 1-6-6v-55.11Z" fill="currentColor" />
        <rect x="1" y="1.073" width="110.5" height="73.454" rx="9" stroke="#fff" stroke-width="2" />
        <path d="M89.48 8.048V7.47M96.363 8.048V7.47M103.246 8.048V7.47" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        <path d="M0 12.983h111.217" stroke="#fff" stroke-width="2" />
        <path d="m93.236 44.384-18.42-11.026 2.93 21.266 5.582-5.237 4.27 6.46 2.98-1.971-4.26-6.446 6.918-3.046Z" fill="#175DDC" stroke="#fff" stroke-width="2" stroke-linejoin="round" />
        <rect width="96.673" height="6.886" rx="3.443" transform="matrix(-1 0 0 1 104.373 18.721)" stroke="#fff" />
      </svg>
    `,
    requiresPremium: true,
  },
  inactive2fa: {
    title: "inactive2faReport",
    description: "inactive2faReportDesc",
    route: "inactive-two-factor-report",
    icon: `
      <svg width="42" height="75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" stroke="#fff" stroke-width="2" d="M1 13.121h39.595v48.758H1z" />
        <rect x="1" y="1" width="39.595" height="73" rx="8" stroke="#fff" stroke-width="2" />
        <path stroke="#fff" stroke-width="2" stroke-linecap="round" d="M12.344 8.091h16.907M18.907 67.424h3.025M31.503 32.515c-2.047-4.337-6.717-7.061-11.73-6.414a11.356 11.356 0 0 0-9.125 7.126M10.816 42.016c2.047 4.337 6.718 7.062 11.73 6.414 4.346-.562 7.8-3.51 9.213-7.358" />
        <path d="m33.584 29.293-1.295 4.625-4.625-1.295M8.523 44.725l1.441-4.581 4.582 1.441" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `,
    requiresPremium: true,
  },
  dataBreach: {
    title: "dataBreachReport",
    description: "breachDesc",
    route: "breach-report",
    icon: `
      <svg width="58" height="75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M39.569 74H13.007a7 7 0 0 1-7-7V31.077a7 7 0 0 1 7-7h19.101a7 7 0 0 1 4.988 2.088l7.46 7.576a7 7 0 0 1 2.013 4.912V67a7 7 0 0 1-7 7Z" fill="#175DDC" stroke="#fff" stroke-width="2" />
        <path d="M44.576 69.055H18.015a7 7 0 0 1-7-7V26.132a7 7 0 0 1 7-7h19.1a7 7 0 0 1 4.988 2.088l7.46 7.576a7 7 0 0 1 2.013 4.911v28.348a7 7 0 0 1-7 7Z" fill="#175DDC" stroke="#fff" stroke-width="2" />
        <path d="M50 63.698H23.439a7 7 0 0 1-7-7V20.775a7 7 0 0 1 7-7h19.1a7 7 0 0 1 4.988 2.088l7.46 7.575A7 7 0 0 1 57 28.35v28.348a7 7 0 0 1-7 7Z" fill="#175DDC" stroke="#fff" stroke-width="2" />
        <path d="M44.648 13.599v3.95a8 8 0 0 0 8 8h4.518" stroke="#fff" stroke-width="2" />
        <path stroke="#fff" stroke-width="2" stroke-linecap="round" d="M23.533 37.736H49.49M23.533 46.802H49.49M23.533 42.269H49.49M23.533 55.456H49.49M23.533 50.923H49.49" />
        <path d="M1 16.483C1 7.944 8.013 1 16.69 1c8.678 0 15.691 6.944 15.691 15.483 0 8.54-7.013 15.484-15.69 15.484C8.012 31.967 1 25.023 1 16.484Z" fill="#518FFF" stroke="#fff" stroke-width="2" />
        <path d="m16.562 7.979.1 11.538" stroke="#fff" stroke-width="2" stroke-linecap="round" />
        <ellipse rx="1.252" ry="1.236" transform="rotate(-.479 2802.219 -1964.476) skewX(.012)" fill="#fff" />
      </svg>
    `,
    requiresPremium: false,
  },
};

@Component({
  selector: "app-report-card",
  templateUrl: "report-card.component.html",
})
export class ReportCardComponent implements OnInit {
  @Input() type: ReportTypes;

  report: ReportEntry;

  hasPremium: boolean;

  constructor(
    private stateService: StateService,
    private messagingService: MessagingService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    this.report = reports[this.type];

    this.hasPremium = await this.stateService.getCanAccessPremium();
  }

  get premium() {
    return this.report.requiresPremium && !this.hasPremium;
  }

  get route() {
    if (this.premium) {
      return null;
    }

    return this.report.route;
  }

  get icon() {
    return this.sanitizer.bypassSecurityTrustHtml(this.report.icon);
  }

  click() {
    if (this.premium) {
      this.messagingService.send("premiumRequired");
    }
  }
}
