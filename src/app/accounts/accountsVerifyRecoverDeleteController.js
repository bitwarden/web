angular
    .module('bit.accounts')

    .controller('accountsVerifyRecoverDeleteController', function ($scope, $state, apiService, toastr, $analytics) {
        if (!$state.params.userId || !$state.params.token || !$state.params.email) {
            $state.go('frontend.login.info').then(function () {
                toastr.error('Invalid parameters.');
            });
            return;
        }

        $scope.email = $state.params.email;

        $scope.delete = function () {
            if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) {
                return;
            }

            $scope.deleting = true;
            apiService.accounts.postDeleteRecoverToken({},
                {
                    token: $state.params.token,
                    userId: $state.params.userId
                }, function () {
                    $analytics.eventTrack('Recovered Delete');
                    $state.go('frontend.login.info', null, { location: 'replace' }).then(function () {
                        toastr.success('Your account has been deleted. You can register a new account again if you like.',
                            'Success');
                    });
                }, function () {
                    $state.go('frontend.login.info', null, { location: 'replace' }).then(function () {
                        toastr.error('Unable to delete account.', 'Error');
                    });
                });
        };
    });
