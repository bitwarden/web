angular
    .module('bit.accounts')

    .controller('accountsLogoutController', function ($scope, authService, $state) {
        authService.logOut();
        $state.go('frontend.login.info');
    });
