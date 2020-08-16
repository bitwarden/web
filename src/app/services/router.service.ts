import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';

@Injectable()
export class RouterService {
    private previousUrl: string = undefined;
    private currentUrl: string = undefined;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private titleService: Title,
        i18nService: I18nService
    ) {
        this.currentUrl = this.router.url;
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;

                let title = i18nService.t('pageTitle', 'Bitwarden');
                let titleId: string = null;
                let rawTitle: string = null;
                let child = this.activatedRoute.firstChild;
                while (child != null) {
                    if (child.firstChild != null) {
                        child = child.firstChild;
                    } else if (child.snapshot.data != null && child.snapshot.data.title != null) {
                        rawTitle = child.snapshot.data.title;
                        break;
                    } else if (child.snapshot.data != null && child.snapshot.data.titleId != null) {
                        titleId = child.snapshot.data.titleId;
                        break;
                    } else {
                        titleId = null;
                        rawTitle = null;
                        break;
                    }
                }

                if (titleId != null || rawTitle != null) {
                    const newTitle = rawTitle != null ? rawTitle : i18nService.t(titleId);
                    if (newTitle != null && newTitle !== '') {
                        title = newTitle + ' | ' + title;
                    }
                }
                this.titleService.setTitle(title);
            }
        });
    }

    getPreviousUrl() {
        return this.previousUrl;
    }

    setPreviousUrl(url: string) {
        this.previousUrl = url;
    }
}
