import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from "@angular/core";
import * as jq from "jquery";
import { first } from "rxjs/operators";

import { ModalRef } from "jslib-angular/components/modal/modal.ref";
import { ModalService as BaseModalService } from "jslib-angular/services/modal.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { Utils } from "jslib-common/misc/utils";

@Injectable()
export class ModalService extends BaseModalService {
  el: any = null;
  modalOpen = false;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    applicationRef: ApplicationRef,
    injector: Injector,
    private messagingService: MessagingService
  ) {
    super(componentFactoryResolver, applicationRef, injector);
  }

  protected setupHandlers(modalRef: ModalRef) {
    modalRef.onCreated.pipe(first()).subscribe(() => {
      const modals = Array.from(document.querySelectorAll(".modal"));
      if (modals.length > 0) {
        this.el = jq(modals[0]);
        this.el.modal("show");

        this.el.on("show.bs.modal", () => {
          modalRef.show();
          this.messagingService.send("modalShow");
        });
        this.el.on("shown.bs.modal", () => {
          modalRef.shown();
          this.messagingService.send("modalShown");
          if (!Utils.isMobileBrowser) {
            this.el.find("*[appAutoFocus]").focus();
          }
        });
        this.el.on("hide.bs.modal", () => {
          this.messagingService.send("modalClose");
        });
        this.el.on("hidden.bs.modal", () => {
          modalRef.closed();
          this.messagingService.send("modalClosed");
        });
      }
    });

    modalRef.onClose.pipe(first()).subscribe(() => {
      if (this.el != null) {
        this.el.modal("hide");
      }
    });
  }
}
