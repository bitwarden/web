angular
    .module('bit.settings')

    .controller('settingsTwoStepRecoverController', function ($scope, apiService, $uibModalInstance, cryptoService,
        $analytics) {
        $analytics.eventTrack('settingsTwoStepRecoverController', { category: 'Modal' });
        $scope.code = null;

        $scope.auth = function (model) {
            $scope.authPromise = cryptoService.hashPassword(model.masterPassword).then(function (hash) {
                return apiService.twoFactor.getRecover({}, {
                    masterPasswordHash: hash
                }).$promise;
            }).then(function (apiResponse) {
                $scope.code = formatString(apiResponse.Code);
                $scope.authed = true;
            });
        };

        $scope.print = function () {
            if (!$scope.code) {
                return;
            }

            $analytics.eventTrack('Print Recovery Code');
            var w = window.open();
            w.document.write('<div style="font-size: 18px; text-align: center;"><p>bitwarden two-step login recovery code:</p>' +
                '<pre>' + $scope.code + '</pre></div><p style="text-align: center;">' + new Date() + '</p>');
            w.print();
            w.close();
        };

        function formatString(s) {
            if (!s) {
                return null;
            }

            return s.replace(/(.{4})/g, '$1 ').trim().toUpperCase();
        }

        $scope.close = function () {
            $uibModalInstance.close();
        };
    });
