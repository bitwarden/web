import { Injectable } from "@angular/core";
import Swal, { SweetAlertIcon } from "sweetalert2";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { ClientType } from "jslib-common/enums/clientType";
import { DeviceType } from "jslib-common/enums/deviceType";
import { ThemeType } from "jslib-common/enums/themeType";

@Injectable()
export class WebPlatformUtilsService implements PlatformUtilsService {
  private browserCache: DeviceType = null;
  private prefersColorSchemeDark = window.matchMedia("(prefers-color-scheme: dark)");

  constructor(
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private logService: LogService,
    private stateService: StateService
  ) {}

  getDevice(): DeviceType {
    if (this.browserCache != null) {
      return this.browserCache;
    }

    if (
      navigator.userAgent.indexOf(" Firefox/") !== -1 ||
      navigator.userAgent.indexOf(" Gecko/") !== -1
    ) {
      this.browserCache = DeviceType.FirefoxBrowser;
    } else if (navigator.userAgent.indexOf(" OPR/") >= 0) {
      this.browserCache = DeviceType.OperaBrowser;
    } else if (navigator.userAgent.indexOf(" Edg/") !== -1) {
      this.browserCache = DeviceType.EdgeBrowser;
    } else if (navigator.userAgent.indexOf(" Vivaldi/") !== -1) {
      this.browserCache = DeviceType.VivaldiBrowser;
    } else if (
      navigator.userAgent.indexOf(" Safari/") !== -1 &&
      navigator.userAgent.indexOf("Chrome") === -1
    ) {
      this.browserCache = DeviceType.SafariBrowser;
    } else if ((window as any).chrome && navigator.userAgent.indexOf(" Chrome/") !== -1) {
      this.browserCache = DeviceType.ChromeBrowser;
    } else if (navigator.userAgent.indexOf(" Trident/") !== -1) {
      this.browserCache = DeviceType.IEBrowser;
    } else {
      this.browserCache = DeviceType.UnknownBrowser;
    }

    return this.browserCache;
  }

  getDeviceString(): string {
    const device = DeviceType[this.getDevice()].toLowerCase();
    return device.replace("browser", "");
  }

  getClientType() {
    return ClientType.Web;
  }

  isFirefox(): boolean {
    return this.getDevice() === DeviceType.FirefoxBrowser;
  }

  isChrome(): boolean {
    return this.getDevice() === DeviceType.ChromeBrowser;
  }

  isEdge(): boolean {
    return this.getDevice() === DeviceType.EdgeBrowser;
  }

  isOpera(): boolean {
    return this.getDevice() === DeviceType.OperaBrowser;
  }

  isVivaldi(): boolean {
    return this.getDevice() === DeviceType.VivaldiBrowser;
  }

  isSafari(): boolean {
    return this.getDevice() === DeviceType.SafariBrowser;
  }

  isMacAppStore(): boolean {
    return false;
  }

  isViewOpen(): Promise<boolean> {
    return Promise.resolve(false);
  }

  launchUri(uri: string, options?: any): void {
    const a = document.createElement("a");
    a.href = uri;
    if (options == null || !options.sameWindow) {
      a.target = "_blank";
      a.rel = "noreferrer noopener";
    }
    a.classList.add("d-none");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
    let blob: Blob = null;
    let type: string = null;
    const fileNameLower = fileName.toLowerCase();
    let doDownload = true;
    if (fileNameLower.endsWith(".pdf")) {
      type = "application/pdf";
      doDownload = false;
    } else if (fileNameLower.endsWith(".xlsx")) {
      type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else if (fileNameLower.endsWith(".docx")) {
      type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileNameLower.endsWith(".pptx")) {
      type = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    } else if (fileNameLower.endsWith(".csv")) {
      type = "text/csv";
    } else if (fileNameLower.endsWith(".png")) {
      type = "image/png";
    } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
      type = "image/jpeg";
    } else if (fileNameLower.endsWith(".gif")) {
      type = "image/gif";
    }
    if (type != null) {
      blobOptions = blobOptions || {};
      if (blobOptions.type == null) {
        blobOptions.type = type;
      }
    }
    if (blobOptions != null) {
      blob = new Blob([blobData], blobOptions);
    } else {
      blob = new Blob([blobData]);
    }

    const a = win.document.createElement("a");
    if (doDownload) {
      a.download = fileName;
    } else if (!this.isSafari()) {
      a.target = "_blank";
    }
    a.href = URL.createObjectURL(blob);
    a.style.position = "fixed";
    win.document.body.appendChild(a);
    a.click();
    win.document.body.removeChild(a);
  }

  getApplicationVersion(): Promise<string> {
    return Promise.resolve(process.env.APPLICATION_VERSION || "-");
  }

  supportsWebAuthn(win: Window): boolean {
    return typeof PublicKeyCredential !== "undefined";
  }

  supportsDuo(): boolean {
    return true;
  }

  showToast(
    type: "error" | "success" | "warning" | "info",
    title: string,
    text: string | string[],
    options?: any
  ): void {
    this.messagingService.send("showToast", {
      text: text,
      title: title,
      type: type,
      options: options,
    });
  }

  async showDialog(
    body: string,
    title?: string,
    confirmText?: string,
    cancelText?: string,
    type?: string,
    bodyIsHtml = false
  ) {
    let iconClasses: string = null;
    if (type != null) {
      // If you add custom types to this part, the type to SweetAlertIcon cast below needs to be changed.
      switch (type) {
        case "success":
          iconClasses = "bwi-check text-success";
          break;
        case "warning":
          iconClasses = "bwi-exclamation-triangle text-warning";
          break;
        case "error":
          iconClasses = "bwi-error text-danger";
          break;
        case "info":
          iconClasses = "bwi-info-circle text-info";
          break;
        default:
          break;
      }
    }

    const bootstrapModal = document.querySelector("div.modal");
    if (bootstrapModal != null) {
      bootstrapModal.removeAttribute("tabindex");
    }

    const iconHtmlStr =
      iconClasses != null ? `<i class="swal-custom-icon bwi ${iconClasses}"></i>` : undefined;
    const confirmed = await Swal.fire({
      heightAuto: false,
      buttonsStyling: false,
      icon: type as SweetAlertIcon, // required to be any of the SweetAlertIcons to output the iconHtml.
      iconHtml: iconHtmlStr,
      text: bodyIsHtml ? null : body,
      html: bodyIsHtml ? body : null,
      titleText: title,
      showCancelButton: cancelText != null,
      cancelButtonText: cancelText,
      showConfirmButton: true,
      confirmButtonText: confirmText == null ? this.i18nService.t("ok") : confirmText,
    });

    if (bootstrapModal != null) {
      bootstrapModal.setAttribute("tabindex", "-1");
    }

    return confirmed.value;
  }

  isDev(): boolean {
    return process.env.NODE_ENV === "development";
  }

  isSelfHost(): boolean {
    return process.env.ENV.toString() === "selfhosted";
  }

  copyToClipboard(text: string, options?: any): void | boolean {
    let win = window;
    let doc = window.document;
    if (options && (options.window || options.win)) {
      win = options.window || options.win;
      doc = win.document;
    } else if (options && options.doc) {
      doc = options.doc;
    }
    if ((win as any).clipboardData && (win as any).clipboardData.setData) {
      // IE specific code path to prevent textarea being shown while dialog is visible.
      (win as any).clipboardData.setData("Text", text);
    } else if (doc.queryCommandSupported && doc.queryCommandSupported("copy")) {
      const textarea = doc.createElement("textarea");
      textarea.textContent = text;
      // Prevent scrolling to bottom of page in MS Edge.
      textarea.style.position = "fixed";
      let copyEl = doc.body;
      // For some reason copy command won't work when modal is open if appending to body
      if (doc.body.classList.contains("modal-open")) {
        copyEl = doc.body.querySelector<HTMLElement>(".modal");
      }
      copyEl.appendChild(textarea);
      textarea.select();
      let success = false;
      try {
        // Security exception may be thrown by some browsers.
        success = doc.execCommand("copy");
        if (!success) {
          this.logService.debug("Copy command unsupported or disabled.");
        }
      } catch (e) {
        // eslint-disable-next-line
        console.warn("Copy to clipboard failed.", e);
      } finally {
        copyEl.removeChild(textarea);
      }
      return success;
    }
  }

  readFromClipboard(options?: any): Promise<string> {
    throw new Error("Cannot read from clipboard on web.");
  }

  supportsBiometric() {
    return Promise.resolve(false);
  }

  authenticateBiometric() {
    return Promise.resolve(false);
  }

  supportsSecureStorage() {
    return false;
  }

  getDefaultSystemTheme(): Promise<ThemeType.Light | ThemeType.Dark> {
    return Promise.resolve(this.prefersColorSchemeDark.matches ? ThemeType.Dark : ThemeType.Light);
  }

  async getEffectiveTheme(): Promise<ThemeType.Light | ThemeType.Dark> {
    const theme = await this.stateService.getTheme();
    if (theme === ThemeType.Dark) {
      return ThemeType.Dark;
    } else if (theme === ThemeType.System) {
      return this.getDefaultSystemTheme();
    } else {
      return ThemeType.Light;
    }
  }

  onDefaultSystemThemeChange(callback: (theme: ThemeType.Light | ThemeType.Dark) => unknown) {
    try {
      this.prefersColorSchemeDark.addEventListener("change", ({ matches }) => {
        callback(matches ? ThemeType.Dark : ThemeType.Light);
      });
    } catch (e) {
      // Safari older than v14
      this.prefersColorSchemeDark.addListener((ev) => {
        callback(ev.matches ? ThemeType.Dark : ThemeType.Light);
      });
    }
  }
}
