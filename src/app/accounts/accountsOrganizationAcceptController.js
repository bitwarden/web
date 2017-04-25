angular
    .module('bit.accounts')

    .controller('accountsOrganizationAcceptController', function ($scope, $state, apiService, authService, toastr) {
        $scope.state = {
            name: $state.current.name,
            params: $state.params
        };

        if (!$state.params.organizationId || !$state.params.organizationUserId || !$state.params.token ||
            !$state.params.email || !$state.params.organizationName) {
            $state.go('frontend.login.info').then(function () {
                toastr.error('Invalid parameters.');
            });
            return;
        }

        $scope.$on('$viewContentLoaded', function () {
            if (authService.isAuthenticated()) {
                $scope.accepting = true;
                apiService.organizationUsers.accept(
                    {
                        orgId: $state.params.organizationId,
                        id: $state.params.organizationUserId
                    },
                    {
                        token: $state.params.token
                    }, function () {
                        $state.go('backend.user.vault', null, { location: 'replace' }).then(function () {
                            toastr.success('You can access this organization once an administrator confirms your membership.' +
                                ' We\'ll send an email when that happens.', 'Invite Accepted', { timeOut: 10000 });
                        });
                    }, function () {
                        $state.go('backend.user.vault', null, { location: 'replace' }).then(function () {
                            toastr.error('Unable to accept invitation.', 'Error');
                        });
                    });
            }
            else {
                $scope.loading = false;
            }
        });

        $scope.submit = function (model) {

        };
    });
