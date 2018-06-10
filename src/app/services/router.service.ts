import { Injectable } from '@angular/core';
import {
    NavigationEnd,
    Router,
} from '@angular/router';

@Injectable()
export class RouterService {
    private previousUrl: string = undefined;
    private currentUrl: string = undefined;

    constructor(private router: Router) {
        this.currentUrl = this.router.url;
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            }
        });
    }

    getPreviousUrl() {
        return this.previousUrl;
    }
}
