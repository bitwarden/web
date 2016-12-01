angular
    .module('bit.accounts')

    .controller('accountsLogoutController', function ($scope, authService, $state, $analytics) {
        authService.logOut();
        $analytics.eventTrack('Logged Out');
        $state.go('frontend.login.info');
    });
