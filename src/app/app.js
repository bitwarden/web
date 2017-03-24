angular
    .module('bit', [
        'ui.router',
        'ngMessages',
        'angular-jwt',
        'angular-md5',
        'ui.bootstrap.showErrors',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',

        'bit.directives',
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.vault',
        'bit.settings',
        'bit.tools',
        'bit.organization'
    ]);
