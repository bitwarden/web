angular
    .module('bit.settings')

    .controller('settingsDomainsController', function ($scope, $state, apiService, toastr, $analytics, $uibModal) {
        $scope.globalEquivalentDomains = [];
        $scope.equivalentDomains = [];

        apiService.settings.getDomains({}, function (response) {
            var i;
            if (response.EquivalentDomains) {
                for (i = 0; i < response.EquivalentDomains.length; i++) {
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
        };

        $scope.customize = function (globalDomain) {
            globalDomain.excluded = true;
            $scope.equivalentDomains.push(globalDomain.domains);
        };

        $scope.delete = function (i) {
            $scope.equivalentDomains.splice(i, 1);
            $scope.$emit('removeAppendedDropdownMenu');
        };

        $scope.addEdit = function (i) {
            var addEditModal = $uibModal.open({
                animation: true,
                templateUrl: 'app/settings/views/settingsAddEditEquivalentDomain.html',
                controller: 'settingsAddEditEquivalentDomainController',
                resolve: {
                    domainIndex: function () { return i; },
                    domains: function () { return i !== null ? $scope.equivalentDomains[i] : null; }
                }
            });

            addEditModal.result.then(function (returnObj) {
                if (returnObj.domains) {
                    returnObj.domains = returnObj.domains.split(' ').join('').split(',').join(', ');
                }

                if (returnObj.index !== null) {
                    $scope.equivalentDomains[returnObj.index] = returnObj.domains;
                }
                else {
                    $scope.equivalentDomains.push(returnObj.domains);
                }
            });
        };

        $scope.saveGlobal = function () {
            $scope.globalPromise = save();
        };

        $scope.saveCustom = function () {
            $scope.customPromise = save();
        };

        var save = function () {
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
                request.EquivalentDomains.push($scope.equivalentDomains[i].split(' ').join('').split(','));
            }

            if (!request.EquivalentDomains.length) {
                request.EquivalentDomains = null;
            }

            if (!request.ExcludedGlobalEquivalentDomains.length) {
                request.ExcludedGlobalEquivalentDomains = null;
            }

            return apiService.settings.putDomains(request, function (domains) {
                toastr.success('Domains have been updated.', 'Success!');
            }).$promise;
        };
    });
