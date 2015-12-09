angular
    .module('bit.accounts')

    .controller('accountsRegisterFinalizeController', function ($scope, $rootScope, $location, $state, apiService, cryptoService, validationService) {
        var params = $location.search();

        if (!params.token || !params.email) {
            $state.go('frontend.login.info');
            return;
        }

        $scope.success = false;
        $scope.model = {
            email: params.email,
            token: params.token
        };

        $scope.info = function () {
            $scope.model.confirmMasterPassword = null;
            $state.go('frontend.registerFinalize.confirm');
        };

        $scope.confirmPromise = null;
        $scope.confirm = function (form) {
            if ($scope.model.masterPassword != $scope.model.confirmMasterPassword) {
                validationService.addError(form, 'ConfirmMasterPassword', 'Master password confirmation does not match.', true);
                return;
            }

            var key = cryptoService.makeKey($scope.model.masterPassword, $scope.model.email);
            var request = {
                token: $scope.model.token,
                name: $scope.model.name,
                email: $scope.model.email,
                masterPasswordHash: cryptoService.hashPassword($scope.model.masterPassword, key),
                masterPasswordHint: $scope.model.masterPasswordHint
            };

            $scope.confirmPromise = apiService.accounts.register(request, function () {
                $scope.success = true;
            }).$promise;
        };

        $scope.loadInfo = function () {
            $scope.model.masterPassword = null;
            window.history.back();
        };
    });
