angular
    .module('bit.accounts')

    .controller('accountsRegisterController', function ($scope, $location, apiService, cryptoService, validationService) {
        var params = $location.search();

        $scope.success = false;
        $scope.model = {
            email: params.email
        };

        $scope.registerPromise = null;
        $scope.register = function (form) {
            if ($scope.model.masterPassword != $scope.model.confirmMasterPassword) {
                validationService.addError(form, 'ConfirmMasterPassword', 'Master password confirmation does not match.', true);
                return;
            }

            var key = cryptoService.makeKey($scope.model.masterPassword, $scope.model.email);
            var request = {
                name: $scope.model.name,
                email: $scope.model.email,
                masterPasswordHash: cryptoService.hashPassword($scope.model.masterPassword, key),
                masterPasswordHint: $scope.model.masterPasswordHint
            };

            $scope.registerPromise = apiService.accounts.register(request, function () {
                $scope.success = true;
            }).$promise;
        };
    });
