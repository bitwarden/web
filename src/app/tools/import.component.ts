import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import * as JSZip from "jszip";
import Swal, { SweetAlertIcon } from "sweetalert2";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { ImportService } from "jslib-common/abstractions/import.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { ImportOption, ImportType } from "jslib-common/enums/importOptions";
import { PolicyType } from "jslib-common/enums/policyType";

@Component({
  selector: "app-import",
  templateUrl: "import.component.html",
})
export class ImportComponent implements OnInit {
  featuredImportOptions: ImportOption[];
  importOptions: ImportOption[];
  format: ImportType = null;
  fileContents: string;
  formPromise: Promise<Error>;
  loading = false;
  importBlockedByPolicy = false;

  protected organizationId: string = null;
  protected successNavigate: any[] = ["vault"];

  constructor(
    protected i18nService: I18nService,
    protected importService: ImportService,
    protected router: Router,
    protected platformUtilsService: PlatformUtilsService,
    protected policyService: PolicyService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.setImportOptions();

    this.importBlockedByPolicy = await this.policyService.policyAppliesToUser(
      PolicyType.PersonalOwnership
    );
  }

  async submit() {
    if (this.importBlockedByPolicy) {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("personalOwnershipPolicyInEffectImports")
      );
      return;
    }

    this.loading = true;

    const importer = this.importService.getImporter(this.format, this.organizationId);
    if (importer === null) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFormat")
      );
      this.loading = false;
      return;
    }

    const fileEl = document.getElementById("file") as HTMLInputElement;
    const files = fileEl.files;
    if (
      (files == null || files.length === 0) &&
      (this.fileContents == null || this.fileContents === "")
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      this.loading = false;
      return;
    }

    let fileContents = this.fileContents;
    if (files != null && files.length > 0) {
      try {
        const content = await this.getFileContents(files[0]);
        if (content != null) {
          fileContents = content;
        }
      } catch (e) {
        this.logService.error(e);
      }
    }

    if (fileContents == null || fileContents === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      this.loading = false;
      return;
    }

    try {
      this.formPromise = this.importService.import(importer, fileContents, this.organizationId);
      const error = await this.formPromise;
      if (error != null) {
        this.error(error);
        this.loading = false;
        return;
      }
      this.platformUtilsService.showToast("success", null, this.i18nService.t("importSuccess"));
      this.router.navigate(this.successNavigate);
    } catch (e) {
      this.logService.error(e);
    }

    this.loading = false;
  }

  getFormatInstructionTitle() {
    if (this.format == null) {
      return null;
    }

    const results = this.featuredImportOptions
      .concat(this.importOptions)
      .filter((o) => o.id === this.format);
    if (results.length > 0) {
      return this.i18nService.t("instructionsFor", results[0].name);
    }
    return null;
  }

  protected setImportOptions() {
    this.featuredImportOptions = [
      {
        id: null,
        name: "-- " + this.i18nService.t("select") + " --",
      },
      ...this.importService.featuredImportOptions,
    ];
    this.importOptions = [...this.importService.regularImportOptions].sort((a, b) => {
      if (a.name == null && b.name != null) {
        return -1;
      }
      if (a.name != null && b.name == null) {
        return 1;
      }
      if (a.name == null && b.name == null) {
        return 0;
      }

      return this.i18nService.collator
        ? this.i18nService.collator.compare(a.name, b.name)
        : a.name.localeCompare(b.name);
    });
  }

  private async error(error: Error) {
    await Swal.fire({
      heightAuto: false,
      buttonsStyling: false,
      icon: "error" as SweetAlertIcon,
      iconHtml: `<i class="swal-custom-icon bwi bwi-error text-danger"></i>`,
      input: "textarea",
      inputValue: error.message,
      inputAttributes: {
        readonly: "true",
      },
      titleText: this.i18nService.t("importError"),
      text: this.i18nService.t("importErrorDesc"),
      showConfirmButton: true,
      confirmButtonText: this.i18nService.t("ok"),
      onOpen: (popupEl) => {
        popupEl.querySelector(".swal2-textarea").scrollTo(0, 0);
      },
    });
  }

  private getFileContents(file: File): Promise<string> {
    if (this.format === "1password1pux") {
      return this.extract1PuxContent(file);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = (evt) => {
        if (this.format === "lastpasscsv" && file.type === "text/html") {
          const parser = new DOMParser();
          const doc = parser.parseFromString((evt.target as any).result, "text/html");
          const pre = doc.querySelector("pre");
          if (pre != null) {
            resolve(pre.textContent);
            return;
          }
          reject();
          return;
        }

        resolve((evt.target as any).result);
      };
      reader.onerror = () => {
        reject();
      };
    });
  }

  private extract1PuxContent(file: File): Promise<string> {
    return new JSZip()
      .loadAsync(file)
      .then((zip) => {
        return zip.file("export.data").async("string");
      })
      .then(
        function success(content) {
          return content;
        },
        function error(e) {
          return "";
        }
      );
  }
}
