function loadScriptIfMissing(condition, path) {
    if (!condition) {
        document.write('<script src="' + path + '?v=' + cacheTag + '"><\/script>');
    }
}

loadScriptIfMissing(window.jQuery, 'lib\/jquery\/jquery.min.js');
loadScriptIfMissing(window.jQuery && window.jQuery.fn && window.jQuery.fn.modal, 'lib\/bootstrap\/js\/bootstrap.min.js');
loadScriptIfMissing(window.angular, 'lib\/angular\/angular.min.js');