import { getQsParam } from './common';

// tslint:disable-next-line
require('./sso.scss');

document.addEventListener('DOMContentLoaded', (event) => {
    const code = getQsParam('code');
    const state = getQsParam('state');

    if (state != null && state.endsWith(':clientId=browser')) {
        initiateBrowserSso(code, state);
    } else {
        window.location.href = window.location.origin + '/#/sso?code=' + code + '&state=' + state;
        // Match any characters between "_returnUri='" and the next "'"
        const returnUri = extractFromRegex(state, '(?<=_returnUri=\')(.*)(?=\')');
        if (returnUri) {
            window.location.href = window.location.origin + `/#${returnUri}`;
        } else {
            window.location.href = window.location.origin + '/#/sso?code=' + code + '&state=' + state;
        }
    }
});

function initiateBrowserSso(code: string, state: string) {
    window.postMessage({ command: 'authResult', code: code, state: state }, '*');
}

function extractFromRegex(s: string, regexString: string) {
    const regex = new RegExp(regexString);
    const results = regex.exec(s);

    if (!results) {
        return null;
    }

    return results[0];
}
