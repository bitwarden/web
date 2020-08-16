import * as DuoWebSDK from 'duo_web_sdk';

// tslint:disable-next-line
require('./duo.scss');

document.addEventListener('DOMContentLoaded', (event) => {
    const frameElement = document.createElement('iframe');
    frameElement.setAttribute('id', 'duo_iframe');
    setFrameHeight();
    document.body.appendChild(frameElement);

    const hostParam = getQsParam('host');
    const requestParam = getQsParam('request');
    DuoWebSDK.init({
        iframe: 'duo_iframe',
        host: hostParam,
        sig_request: requestParam,
        submit_callback: (form: any) => {
            invokeCSCode(form.elements.sig_response.value);
        },
    });

    window.onresize = setFrameHeight;

    function setFrameHeight() {
        frameElement.style.height = window.innerHeight + 'px';
    }
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

function invokeCSCode(data: string) {
    try {
        (window as any).invokeCSharpAction(data);
    } catch (err) {}
}
