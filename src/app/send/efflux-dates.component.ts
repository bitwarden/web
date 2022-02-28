import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";
import { ControlContainer, NgForm } from "@angular/forms";

import { EffluxDatesComponent as BaseEffluxDatesComponent } from "jslib-angular/components/send/efflux-dates.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-send-efflux-dates",
  templateUrl: "efflux-dates.component.html",
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class EffluxDatesComponent extends BaseEffluxDatesComponent {
  constructor(
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected datePipe: DatePipe
  ) {
    super(i18nService, platformUtilsService, datePipe);
  }
}
