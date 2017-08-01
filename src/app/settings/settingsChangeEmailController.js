angular
    .module('bit.settings')

    .controller('settingsChangeEmailController', function ($scope, $state, apiService, $uibModalInstance, cryptoService,
        authService, toastr, $analytics, validationService) {
        $analytics.eventTrack('settingsChangeEmailController', { category: 'Modal' });

        var _masterPasswordHash,
            _masterPassword,
            _newEmail;

        $scope.token = function (model, form) {
            var encKey = cryptoService.getEncKey();
            if (!encKey) {
                validationService.addError(form, null,
                    'You cannot change your email until you update your encryption key.', true);
                return;
            }

            _masterPassword = model.masterPassword;
            _newEmail = model.newEmail.toLowerCase();

            $scope.tokenPromise = cryptoService.hashPassword(_masterPassword).then(function (hash) {
                _masterPasswordHash = hash;

                var request = {
                    newEmail: _newEmail,
                    masterPasswordHash: _masterPasswordHash
                };

                return apiService.accounts.emailToken(request, function () {
                    $scope.tokenSent = true;
                }).$promise;
            });
        };

        $scope.confirm = function (model) {
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
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
