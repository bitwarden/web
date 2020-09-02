import { getQsParam } from './common';

document.addEventListener('DOMContentLoaded', (event) => {
    init();
});

let parentUrl: string = null;
let parentOrigin: string = null;
let version: number = null;
let stopWebAuthn = false;
let sentSuccess = false;

function init() {
    start();
    onMessage();
    info('ready');
}

function start() {
    sentSuccess = false;

    if (!('credentials' in navigator)) {
        error('WebAuthn is not supported in this browser.');
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

    const versionQs = getQsParam('v');
    if (!versionQs) {
        error('No version.');
        return;
    }

    let json: any;
    try {
        version = parseInt(versionQs, 10);
        const jsonString = b64Decode(data);
        json = JSON.parse(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    stopWebAuthn = false
    initU2f(json);
}

function initU2f(obj: any) {
    if (stopWebAuthn) {
        return;
    }

    const challenge = obj.challenge.replace(/-/g, '+').replace(/_/g, '/');
    obj.challenge = Uint8Array.from(atob(challenge), c => c.charCodeAt(0));

    // fix escaping. Change this to coerce
    obj.allowCredentials.forEach((listItem: any) => {
        const fixedId = listItem.id.replace(/\_/g, '/').replace(/\-/g, '+');
        listItem.id = Uint8Array.from(atob(fixedId), c => c.charCodeAt(0));
    });

    navigator.credentials.get({ publicKey: obj })
        .then(success)
        .catch(err => error('WebAuth Error: ' + err));
}

function onMessage() {
    window.addEventListener('message', (event) => {
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
    parent.postMessage('success|' + dataString, parentUrl);
    sentSuccess = true;
}

function info(message: string) {
    parent.postMessage('info|' + message, parentUrl);
}

function b64Decode(str: string) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

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
