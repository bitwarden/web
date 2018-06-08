import {
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';

@Component({
    selector: 'app-frontend-layout',
    templateUrl: 'frontend-layout.component.html',
})
export class FrontendLayoutComponent implements OnInit, OnDestroy {
    ngOnInit() {
        document.body.classList.add('layout_frontend');
    }

    ngOnDestroy() {
        document.body.classList.remove('layout_frontend');
    }
}
