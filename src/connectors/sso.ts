// tslint:disable-next-line
require('./sso.scss');

document.addEventListener('DOMContentLoaded', (event) => {
    const code = getQsParam('code');
    const state = getQsParam('state');

    if (state != null && state.includes(':clientId=browser')) {
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

function getQsParam(name: string) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);

    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function initiateBrowserSso(code: string, state: string) {
    window.postMessage({ command: 'authResult', code: code, state: state }, '*');
    document.getElementById('content').innerHTML = '<p>Successfully passed off authentication to the extension.</p>' +
        '<p>You may now close this tab and return to the extension.</p>';
}

function extractFromRegex(s: string, regexString: string) {
    const regex = new RegExp(regexString);
    const results = regex.exec(s);

    if (!results) {
        return null;
    }

    return results[0];
}
