angular
    .module('bit.settings')

    .controller('settingsDomainsController', function ($scope, $state, apiService, $uibModalInstance, toastr, $analytics) {
        $analytics.eventTrack('settingsDomainsController', { category: 'Modal' });

        $scope.globalEquivalentDomains = [];
        $scope.equivalentDomains = [];

        apiService.accounts.getDomains({}, function (response) {
            if (response.EquivalentDomains) {
                for (var i = 0; i < response.EquivalentDomains.length; i++) {
                    $scope.equivalentDomains.push(response.EquivalentDomains[i].join(', '));
                }
            }

            if (response.GlobalEquivalentDomains) {
                for (i = 0; i < response.GlobalEquivalentDomains.length; i++) {
                    $scope.globalEquivalentDomains.push({
                        domains: response.GlobalEquivalentDomains[i].Domains.join(', '),
                        excluded: response.GlobalEquivalentDomains[i].Excluded,
                        key: response.GlobalEquivalentDomains[i].Type
                    });
                }
            }
        });

        $scope.toggleExclude = function (globalDomain) {
            globalDomain.excluded = !globalDomain.excluded;
        }

        $scope.customize = function (globalDomain) {
            globalDomain.excluded = true;
            $scope.equivalentDomains.push(globalDomain.domains);
        }

        $scope.delete = function (i) {
            $scope.equivalentDomains.splice(i, 1);
        }

        $scope.submit = function () {
            var request = {
                ExcludedGlobalEquivalentDomains: [],
                EquivalentDomains: []
            };

            for (var i = 0; i < $scope.globalEquivalentDomains.length; i++) {
                if ($scope.globalEquivalentDomains[i].excluded) {
                    request.ExcludedGlobalEquivalentDomains.push($scope.globalEquivalentDomains[i].key);
                }
            }

            for (i = 0; i < $scope.equivalentDomains.length; i++) {
                request.EquivalentDomains.push($scope.equivalentDomains[i].split(' ').join('').split(', '));
            }

            if (!request.EquivalentDomains.length) {
                request.EquivalentDomains = null;
            }

            if (!request.ExcludedGlobalEquivalentDomains.length) {
                request.ExcludedGlobalEquivalentDomains = null;
            }

            $scope.submitPromise = apiService.accounts.putDomains(request, function (domains) {
                $scope.close();
                toastr.success('Domains have been updated.', 'Success!');
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
