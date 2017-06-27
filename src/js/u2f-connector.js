document.addEventListener('DOMContentLoaded', function (event) {
    init();
});

var parentUrl = null,
    parentOrigin = null,
    version = null,
    stop = false,
    sentSuccess = false;

function init() {
    start();
    onMessage();
    info('ready');
}

function start() {
    sentSuccess = false;

    if (!u2f.isSupported) {
        error('U2F is not supported in this browser.');
        return;
    }

    var data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    parentUrl = getQsParam('parent');
    if (!parentUrl) {
        error('No parent.');
        return;
    }
    else {
        var link = document.createElement('a');
        link.href = parentUrl;
        parentOrigin = link.origin;
    }

    var versionQs = getQsParam('v');
    if (!versionQs) {
        error('No version.');
        return;
    }

    try {
        version = parseInt(versionQs);
        var jsonString = b64Decode(data);
        var json = JSON.parse(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    if (!json.appId || !json.challenge || !json.keys || !json.keys.length) {
        error('Invalid data parameters.');
        return;
    }

    stop = false
    initU2f(json);
}

function initU2f(obj) {
    if (stop) {
        return;
    }

    u2f.sign(obj.appId, obj.challenge, obj.keys, function (data) {
        if (data.errorCode) {
            if (data.errorCode === 5) {
                initU2f(obj);
                return;
            }

            error('U2F Error: ' + data.errorCode);
            return;
        }

        success(data);
    }, 5);
}

function onMessage() {
    window.addEventListener('message', function (event) {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'stop') {
            stop = true;
        }
        else if (event.data === 'start' && stop) {
            start();
        }
    }, false);
}

function error(message) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(data) {
    if (sentSuccess) {
        return;
    }

    var dataString = JSON.stringify(data);
    parent.postMessage('success|' + dataString, parentUrl);
    sentSuccess = true;
}

function info(message) {
    parent.postMessage('info|' + message, parentUrl);
}

function getQsParam(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function b64Decode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
