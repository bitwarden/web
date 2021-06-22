import { getQsParam } from './common';

declare var hcaptcha: any;

// tslint:disable-next-line
require('./captcha.scss');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

(window as any).captchaSuccess = captchaSuccess;
(window as any).captchaError = captchaError;

let parentUrl: string = null;
let parentOrigin: string = null;
let sentSuccess = false;

function init() {
    start();
    onMessage();
    info('ready');
}

function start() {
    sentSuccess = false;

    const data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    parentUrl = getQsParam('parent');
    if (!parentUrl) {
        error('No parent.');
        return;
    } else {
        parentUrl = decodeURIComponent(parentUrl);
        parentOrigin = new URL(parentUrl).origin;
    }

    hcaptcha.render('captcha', {
        sitekey: 'bc38c8a2-5311-4e8c-9dfc-49e99f6df417',
        callback: 'captchaSuccess',
        'error-callback': 'captchaError',
    });
}

function captchaSuccess(response: string) {
    success(response);
}

function captchaError() {
    error('An error occurred with the captcha. Try again.');
}

function onMessage() {
    window.addEventListener('message', event => {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'start') {
            start();
        }
    }, false);
}

function error(message: string) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(data: string) {
    if (sentSuccess) {
        return;
    }
    parent.postMessage('success|' + data, parentUrl);
    sentSuccess = true;
}

function info(message: string) {
    parent.postMessage('info|' + message, parentUrl);
}

