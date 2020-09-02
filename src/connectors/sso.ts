import { getQsParam } from './common';

// tslint:disable-next-line
require('./sso.scss');

document.addEventListener('DOMContentLoaded', (event) => {
    const code = getQsParam('code');
    const state = getQsParam('state');
    window.location.href = window.location.origin + '/#/sso?code=' + code + '&state=' + state;
});
