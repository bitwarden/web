import { Injectable } from "@angular/core";

import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";

@Injectable()
export class BroadcasterMessagingService implements MessagingService {
  constructor(private broadcasterService: BroadcasterService) {}

  send(subscriber: string, arg: any = {}) {
    const message = Object.assign({}, { command: subscriber }, arg);
    this.broadcasterService.send(message);
  }
}
