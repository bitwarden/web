import * as DuoWebSDK from 'duo_web_sdk';
import { getQsParam } from './common';

// tslint:disable-next-line
require('./duo.scss');

document.addEventListener('DOMContentLoaded', event => {
    const frameElement = document.createElement('iframe');
    frameElement.setAttribute('id', 'duo_iframe');
    setFrameHeight();
    document.body.appendChild(frameElement);

    const hostParam = getQsParam('host');
    const requestParam = getQsParam('request');

    var hostUrl = new URL('https://' + hostParam);
    if (!hostUrl.hostname.endsWith('.duosecurity.com') && !hostUrl.hostname.endsWith('.duofederal.com')) {
        return;
    }

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

function invokeCSCode(data: string) {
    try {
        (window as any).invokeCSharpAction(data);
    } catch (err) {
        // tslint:disable-next-line
        console.log(err);
    }
}
