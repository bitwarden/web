angular
    .module('bit.vault')

    .controller('settingsAddEditEquivalentDomainController', function ($scope, $uibModalInstance, $analytics, domainIndex, domains) {
        $analytics.eventTrack('settingsAddEditEquivalentDomainController', { category: 'Modal' });

        $scope.domains = domains;
        $scope.index = domainIndex;

        $scope.submit = function (form) {
            $analytics.eventTrack((domainIndex ? 'Edited' : 'Added') + ' Equivalent Domain');
            $uibModalInstance.close({ domains: $scope.domains, index: domainIndex });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
