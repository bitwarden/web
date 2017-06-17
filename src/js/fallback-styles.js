var cacheTag = '/* @echo cacheTag */' || '';

function loadStylesheetIfMissing(property, value, paths) {
    var scripts = document.getElementsByTagName('SCRIPT'),
        siblings = scripts[scripts.length - 1].previousElementSibling,
        meta = document.defaultView && document.defaultView.getComputedStyle ?
            document.defaultView.getComputedStyle(siblings) : siblings.currentStyle;

    if (meta && meta[property] !== value) {
        for (var i = 0; i < paths.length; i++) {
            document.write('<link rel="stylesheet" href="' + paths[i] + '?v=' + cacheTag + '" />');
        }
    }
}

loadStylesheetIfMissing('visibility', 'hidden', ['lib\/bootstrap\/css\/bootstrap.min.css']);
loadStylesheetIfMissing('fontFamily', 'FontAwesome', ['lib\/font-awesome\/css\/font-awesome.min.css']);
