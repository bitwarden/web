import { MessagingService } from 'jslib/abstractions/messaging.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

export class BroadcasterMessagingService implements MessagingService {
    constructor(private broadcasterService: BroadcasterService) {}

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        this.broadcasterService.send(message);
    }
}
