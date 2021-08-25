import { b64Decode, getQsParam } from './common';
import { buildDataString, parseWebauthnJson } from './common-webauthn';

// tslint:disable-next-line
require('./webauthn.scss');

let parsed = false;
let webauthnJson: any;
let btnText: string = null;
let parentUrl: string = null;
let parentOrigin: string = null;
let stopWebAuthn = false;
let sentSuccess = false;
let obj: any = null;

document.addEventListener('DOMContentLoaded', () => {
    init();

    parseParameters();
    if (btnText) {
        const button = document.getElementById('webauthn-button');
        button.innerText = decodeURI(btnText);
        button.onclick = executeWebAuthn;
    }
});

function init() {
    start();
    onMessage();
    info('ready');
}

function parseParameters() {
    if (parsed) {
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

    const version = getQsParam('v');

    if (version === '1') {
        parseParametersV1();
    } else {
        parseParametersV2();
    }
    parsed = true;
}

function parseParametersV1() {
    const data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    webauthnJson = b64Decode(data);
    btnText = getQsParam('btnText');
}

function parseParametersV2() {
    let dataObj: { data: any, btnText: string; } = null;
    try {
        dataObj = JSON.parse(b64Decode(getQsParam('data')));
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    webauthnJson = dataObj.data;
    btnText = dataObj.btnText;
}

function start() {
    sentSuccess = false;

    if (!('credentials' in navigator)) {
        error('WebAuthn is not supported in this browser.');
        return;
    }

    parseParameters();
    if (!webauthnJson) {
        error('No data.');
        return;
    }

    try {
        obj = parseWebauthnJson(webauthnJson);
    }
    catch (e) {
        error('Cannot parse webauthn data.');
        return;
    }

    stopWebAuthn = false;

    if (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
        // TODO: Hide image, show button
    } else {
        executeWebAuthn();
    }
}

function executeWebAuthn() {
    if (stopWebAuthn) {
        return;
    }

    navigator.credentials.get({ publicKey: obj })
        .then(success)
        .catch(err => error('WebAuth Error: ' + err));
}

function onMessage() {
    window.addEventListener('message', event => {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'stop') {
            stopWebAuthn = true;
        }
        else if (event.data === 'start' && stopWebAuthn) {
            start();
        }
    }, false);
}

function error(message: string) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(assertedCredential: PublicKeyCredential) {
    if (sentSuccess) {
        return;
    }

    const dataString = buildDataString(assertedCredential);
    parent.postMessage('success|' + dataString, parentUrl);
    sentSuccess = true;
}

function info(message: string) {
    parent.postMessage('info|' + message, parentUrl);
}

