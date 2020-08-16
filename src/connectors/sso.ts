// tslint:disable-next-line
require('./sso.scss');

document.addEventListener('DOMContentLoaded', (event) => {
    const code = getQsParam('code');
    const state = getQsParam('state');
    window.location.href = window.location.origin + '/#/sso?code=' + code + '&state=' + state;
});

function getQsParam(name: string) {
    const url = window.location.href;
    // eslint-disable-next-line no-useless-escape
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
