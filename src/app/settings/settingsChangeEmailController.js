angular
    .module('bit.settings')

    .controller('settingsChangeEmailController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        cipherService, authService, $q, toastr, $analytics) {
        $analytics.eventTrack('settingsChangeEmailController', { category: 'Modal' });

        var _masterPasswordHash,
            _masterPassword,
            _newEmail;

        $scope.token = function (model) {
            _masterPassword = model.masterPassword;
            _newEmail = model.newEmail.toLowerCase();

            cryptoService.hashPassword(_masterPassword).then(function (hash) {
                _masterPasswordHash = hash;

                var encKey = cryptoService.getEncKey();
                if (encKey) {
                    $scope.tokenPromise = requestToken();
                }
                else {
                    // User is not using an enc key, let's make them one
                    $scope.tokenPromise = cipherService.updateKey(_masterPasswordHash, function () {
                        return requestToken();
                    }, function (err) {
                        toastr.error('Something went wrong.', 'Oh No!');
                    });
                }
            });
        };

        function requestToken() {
            var request = {
                newEmail: _newEmail,
                masterPasswordHash: _masterPasswordHash
            };

            return apiService.accounts.emailToken(request, function () {
                $scope.tokenSent = true;
            }).$promise;
        }

        $scope.confirm = function (model) {
            $scope.processing = true;

            $scope.confirmPromise = cryptoService.makeKeyAndHash(_newEmail, _masterPassword).then(function (result) {
                var encKey = cryptoService.getEncKey();
                var newEncKey = cryptoService.encrypt(encKey.key, result.key, 'raw');
                var request = {
                    token: model.token,
                    newEmail: _newEmail,
                    masterPasswordHash: _masterPasswordHash,
                    newMasterPasswordHash: result.hash,
                    key: newEncKey
                };

                return apiService.accounts.email(request).$promise;
            }).then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Changed Email');
                return $state.go('frontend.login.info');
            }).then(function () {
                toastr.success('Please log back in.', 'Email Changed');
            }, function () {
                $uibModalInstance.dismiss('cancel');
                toastr.error('Something went wrong. Try again.', 'Oh No!');
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
