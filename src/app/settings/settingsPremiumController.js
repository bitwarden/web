angular
    .module('bit.settings')

    .controller('settingsPremiumController', function ($scope, $state, apiService, toastr, $analytics, authService, stripe) {
        authService.getUserProfile().then(function (profile) {
            if (profile.premium) {
                return $state.go('backend.user.settingsBilling');
            }
        });

        $scope.storageGbPrice = 4;
        $scope.premiumPrice = 10;

        $scope.model = {
            additionalStorageGb: null
        };

        $scope.totalPrice = function () {
            return $scope.premiumPrice + (($scope.model.additionalStorageGb || 0) * $scope.storageGbPrice);
        };

        $scope.submit = function (model) {
            $scope.submitPromise = stripe.card.createToken(model.card).then(function (response) {
                var request = {
                    paymentToken: response.id,
                    additionalStorageGb: model.additionalStorageGb
                };

                return apiService.accounts.postPremium(request).$promise;
            }).then(function (result) {
                $analytics.eventTrack('Signed Up Premium');
                return authService.refreshAccessToken();
            }).then(function () {
                return $state.go('backend.user.settingsBilling');
            }).then(function () {
                toastr.success('Premium upgrade complete.', 'Success');
            });
        };
    });
