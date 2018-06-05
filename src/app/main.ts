import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// tslint:disable-next-line
require('../scss/styles.scss');

import { AppModule } from './app.module';

// enableProdMode(); // TODO: if production

platformBrowserDynamic().bootstrapModule(AppModule);
