import { Component, OnDestroy } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-reports",
  templateUrl: "reports.component.html",
})
export class ReportsComponent implements OnDestroy {
  homepage = true;
  subscription: Subscription;

  constructor(router: Router) {
    this.subscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.homepage = (event as NavigationEnd).url == "/reports";
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
