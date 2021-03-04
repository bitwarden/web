import { getQsParam } from './common';
import { b64Decode, buildDataString } from './common-webauthn';

// tslint:disable-next-line
require('./webauthn-fallback.scss');

let parentUrl: string = null;
let parentOrigin: string = null;
let sentSuccess = false;

let locales: any = {};

document.addEventListener('DOMContentLoaded', async () => {
    const locale = getQsParam('locale');

    const filePath = `locales/${locale}/messages.json?cache=${process.env.CACHE_TAG}`;
    const localesResult = await fetch(filePath);
    locales = await localesResult.json();

    document.getElementById('msg').innerText = translate('webAuthnFallbackMsg');
    document.getElementById('remember-label').innerText = translate('rememberMe');
    document.getElementById('webauthn-button').innerText = translate('webAuthnAuthenticate');

    document.getElementById('spinner').classList.add('d-none');
    const content = document.getElementById('content');
    content.classList.add('d-block');
    content.classList.remove('d-none');
});

function translate(id: string) {
    return locales[id]?.message || '';
}

(window as any).init = () => {
    start();
};

function start() {
    if (sentSuccess) {
        return;
    }

    if (!('credentials' in navigator)) {
        error(translate('webAuthnNotSupported'));
        return;
    }

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

    let json: any;
    try {
        const jsonString = b64Decode(data);
        json = JSON.parse(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    initWebAuthn(json);
}

async function initWebAuthn(obj: any) {
    const challenge = obj.challenge.replace(/-/g, '+').replace(/_/g, '/');
    obj.challenge = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));

    // fix escaping. Change this to coerce
    obj.allowCredentials.forEach((listItem: any) => {
        const fixedId = listItem.id.replace(/\_/g, '/').replace(/\-/g, '+');
        listItem.id = Uint8Array.from(atob(fixedId), c => c.charCodeAt(0));
    });

    try {
        const assertedCredential = await navigator.credentials.get({ publicKey: obj }) as PublicKeyCredential;
        
        if (sentSuccess) {
            return;
        }

        const dataString = buildDataString(assertedCredential);
        const remember = (document.getElementById('remember') as HTMLInputElement).checked;
        window.postMessage({ command: 'webAuthnResult', data: dataString, remember: remember }, '*');

        sentSuccess = true;
        success(translate('webAuthnSuccess'));
    } catch (err) {
        error(err);
    }
}

function error(message: string) {
    const el = document.getElementById('msg');
    el.innerHTML = message;
    el.classList.add('alert');
    el.classList.add('alert-danger');
}

function success(message: string) {
    (document.getElementById('webauthn-button') as HTMLButtonElement).disabled = true;

    const el = document.getElementById('msg');
    el.innerHTML = message;
    el.classList.add('alert');
    el.classList.add('alert-success');
}
