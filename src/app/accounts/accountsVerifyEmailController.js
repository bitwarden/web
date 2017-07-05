angular
    .module('bit.accounts')

    .controller('accountsVerifyEmailController', function ($scope, $state, apiService, toastr, $analytics) {
        if (!$state.params.userId || !$state.params.token) {
            $state.go('frontend.login.info').then(function () {
                toastr.error('Invalid parameters.');
            });
            return;
        }

        $scope.$on('$viewContentLoaded', function () {
            apiService.accounts.verifyEmailToken({},
                {
                    token: $state.params.token,
                    userId: $state.params.userId
                }, function () {
                    $analytics.eventTrack('Verified Email');
                    $state.go('frontend.login.info', null, { location: 'replace' }).then(function () {
                        toastr.success('Your email has been verified. Thank you.', 'Success');
                    });
                }, function () {
                    $state.go('frontend.login.info', null, { location: 'replace' }).then(function () {
                        toastr.error('Unable to verify email.', 'Error');
                    });
                });
        });
    });
