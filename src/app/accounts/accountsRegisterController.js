angular
    .module('bit.accounts')

    .controller('accountsRegisterController', function ($scope, $location, apiService, cryptoService, validationService,
        $analytics, $state) {
        var params = $location.search();
        var stateParams = $state.params;

        $scope.returnState = $state.params.returnState;
        $scope.success = false;
        $scope.model = {
            email: params.email ? params.email : stateParams.email
        };
        $scope.readOnlyEmail = stateParams.email !== null;

        $scope.registerPromise = null;
        $scope.register = function (form) {
            var error = false;

            if ($scope.model.masterPassword.length < 8) {
                validationService.addError(form, 'MasterPassword', 'Master password must be at least 8 characters long.', true);
                error = true;
            }
            if ($scope.model.masterPassword !== $scope.model.confirmMasterPassword) {
                validationService.addError(form, 'ConfirmMasterPassword', 'Master password confirmation does not match.', true);
                error = true;
            }

            if (error) {
                return;
            }

            var email = $scope.model.email.toLowerCase();
            var key = cryptoService.makeKey($scope.model.masterPassword, email);
            cryptoService.makeKeyPair(key, function (publicKey, privateKeyEnc, errors) {
                if (errors) {
                    validationService.addError(form, null, 'Problem generating keys.', true);
                    return;
                }

                var request = {
                    name: $scope.model.name,
                    email: email,
                    masterPasswordHash: cryptoService.hashPassword($scope.model.masterPassword, key),
                    masterPasswordHint: $scope.model.masterPasswordHint,
                    keys: {
                        publicKey: publicKey,
                        encryptedPrivateKey: privateKeyEnc
                    }
                };

                $scope.registerPromise = apiService.accounts.register(request, function () {
                    $scope.success = true;
                    $analytics.eventTrack('Registered');
                }).$promise;
            });
        };
    });
