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
            _masterPasswordHash = cryptoService.hashPassword(_masterPassword);
            _newEmail = model.newEmail.toLowerCase();

            var encKey = cryptoService.getEncKey();
            if (encKey) {
                $scope.tokenPromise = requestToken(model);
            }
            else {
                // User is not using an enc key, let's make them one
                $scope.tokenPromise = cipherService.updateKey(_masterPasswordHash, function () {
                    return requestToken(model);
                }, processError);
            }
        };

        function requestToken(model) {
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

            var newKey = cryptoService.makeKey(_masterPassword, _newEmail);
            var encKey = cryptoService.getEncKey();
            var newEncKey = cryptoService.encrypt(encKey.key, newKey, 'raw');

            var request = {
                token: model.token,
                newEmail: _newEmail,
                masterPasswordHash: _masterPasswordHash,
                newMasterPasswordHash: cryptoService.hashPassword(_masterPassword, newKey),
                key: newEncKey
            };

            $scope.confirmPromise = apiService.accounts.email(request).$promise.then(function () {
                $uibModalInstance.dismiss('cancel');
                authService.logOut();
                $analytics.eventTrack('Changed Email');
                return $state.go('frontend.login.info');
            }, processError).then(function () {
                toastr.success('Please log back in.', 'Email Changed');
            }, processError);
        };

        function processError() {
            $uibModalInstance.dismiss('cancel');
            toastr.error('Something went wrong. Try again.', 'Oh No!');
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
