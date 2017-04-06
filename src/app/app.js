angular
    .module('bit', [
        'ui.router',
        'ngMessages',
        'angular-jwt',
        'ui.bootstrap.showErrors',
        'toastr',
        'angulartics',
        'angulartics.google.analytics',
        'angular-stripe',
        'credit-cards',

        'bit.directives',
        'bit.filters',
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.vault',
        'bit.settings',
        'bit.tools',
        'bit.organization'
    ]);
