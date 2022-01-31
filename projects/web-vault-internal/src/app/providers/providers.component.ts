import { Component, Input, OnInit } from "@angular/core";

import { I18nService } from "jslib-common/abstractions/i18n.service";
import { ProviderService } from "jslib-common/abstractions/provider.service";

import { Provider } from "jslib-common/models/domain/provider";

import { Utils } from "jslib-common/misc/utils";

@Component({
  selector: "app-providers",
  templateUrl: "providers.component.html",
})
export class ProvidersComponent implements OnInit {
  @Input() vault = false;

  providers: Provider[];
  loaded: boolean = false;
  actionPromise: Promise<any>;

  constructor(private providerService: ProviderService, private i18nService: I18nService) {}

  async ngOnInit() {
    document.body.classList.remove("layout_frontend");
    await this.load();
  }

  async load() {
    const providers = await this.providerService.getAll();
    providers.sort(Utils.getSortFunction(this.i18nService, "name"));
    this.providers = providers;
    this.loaded = true;
  }
}
