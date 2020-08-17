import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import 'bootstrap';
import 'jquery';
import 'popper.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('../scss/styles.scss');

import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
    preserveWhitespaces: true,
});
