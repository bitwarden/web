import { getQsParam } from './common';

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
}

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
        const link = document.createElement('a');
        link.href = parentUrl;
        parentOrigin = link.origin;
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

function initWebAuthn(obj: any) {
    const challenge = obj.challenge.replace(/-/g, '+').replace(/_/g, '/');
    obj.challenge = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));

    // fix escaping. Change this to coerce
    obj.allowCredentials.forEach((listItem: any) => {
        const fixedId = listItem.id.replace(/\_/g, '/').replace(/\-/g, '+');
        listItem.id = Uint8Array.from(atob(fixedId), c => c.charCodeAt(0));
    });

    navigator.credentials.get({ publicKey: obj })
        .then((assertedCredential: PublicKeyCredential) => {
            if (sentSuccess) {
                return;
            }

            const response = assertedCredential.response as AuthenticatorAssertionResponse;
        
            const authData = new Uint8Array(response.authenticatorData);
            const clientDataJSON = new Uint8Array(response.clientDataJSON);
            const rawId = new Uint8Array(assertedCredential.rawId);
            const sig = new Uint8Array(response.signature);
        
            const data = {
                id: assertedCredential.id,
                rawId: coerceToBase64Url(rawId),
                type: assertedCredential.type,
                extensions: assertedCredential.getClientExtensionResults(),
                response: {
                    authenticatorData: coerceToBase64Url(authData),
                    clientDataJson: coerceToBase64Url(clientDataJSON),
                    signature: coerceToBase64Url(sig)
                }
            };
        
            const dataString = JSON.stringify(data);
            const remember = (document.getElementById("remember") as HTMLInputElement).checked;
            window.postMessage({ command: 'webAuthnResult', data: dataString, remember: remember }, '*');

            sentSuccess = true;
            success(translate('webAuthnSuccess'))
        })
        .catch(err => error(err));
}

function error(message: string) {
    const el = document.getElementById('msg');
    el.innerHTML = message;
    el.classList.add('alert');
    el.classList.add('alert-danger');
}

function success(message: string) {
    (document.querySelector("#webauthn-button") as any).disabled = true;

    const el = document.getElementById('msg');
    el.innerHTML = message;
    el.classList.add('alert');
    el.classList.add('alert-success');
}

function b64Decode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

// From https://github.com/abergs/fido2-net-lib/blob/b487a1d47373ea18cd752b4988f7262035b7b54e/Demo/wwwroot/js/helpers.js#L34
// License: https://github.com/abergs/fido2-net-lib/blob/master/LICENSE.txt
function coerceToBase64Url(thing: any) {
    // Array or ArrayBuffer to Uint8Array
    if (Array.isArray(thing)) {
        thing = Uint8Array.from(thing);
    }

    if (thing instanceof ArrayBuffer) {
        thing = new Uint8Array(thing);
    }

    // Uint8Array to base64
    if (thing instanceof Uint8Array) {
        let str = '';
        const len = thing.byteLength;

        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(thing[i]);
        }
        thing = window.btoa(str);
    }

    if (typeof thing !== 'string') {
        throw new Error('could not coerce to string');
    }

    // base64 to base64url
    // NOTE: "=" at the end of challenge is optional, strip it off here
    thing = thing.replace(/\+/g, '-').replace(/\//g, '_').replace(/=*$/g, '');

    return thing;
};
