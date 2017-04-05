angular
    .module('bit.vault')

    .controller('vaultShareController', function ($scope, apiService, $uibModalInstance, authService, cipherService, loginId, $analytics) {
        $analytics.eventTrack('vaultShareController', { category: 'Modal' });
        $scope.model = {};
        $scope.login = {};
        $scope.subvaults = [];
        $scope.selectedSubvaults = {};
        $scope.organizations = [];
        $scope.loadingSubvaults = true;
        $scope.readOnly = false;

        apiService.logins.get({ id: loginId }).$promise.then(function (login) {
            $scope.readOnly = !login.Edit;
            if (login.Edit) {
                $scope.login = cipherService.decryptLogin(login);
            }

            return login.Edit;
        }).then(function (canEdit) {
            if (!canEdit) {
                return;
            }

            return authService.getUserProfile();
        }).then(function (profile) {
            if (profile && profile.organizations) {
                var orgs = [],
                    setFirstOrg = false;

                for (var i in profile.organizations) {
                    if (profile.organizations.hasOwnProperty(i)) {
                        orgs.push({
                            id: profile.organizations[i].id,
                            name: profile.organizations[i].name
                        });

                        if (!setFirstOrg) {
                            setFirstOrg = true;
                            $scope.model.organizationId = profile.organizations[i].id;
                        }
                    }
                }

                $scope.organizations = orgs;

                apiService.subvaults.listMe(function (response) {
                    var subvaults = [];
                    for (var i = 0; i < response.Data.length; i++) {
                        var decSubvault = cipherService.decryptSubvault(response.Data[i]);
                        decSubvault.organizationId = response.Data[i].OrganizationId;
                        subvaults.push(decSubvault);
                    }

                    $scope.subvaults = subvaults;
                    $scope.loadingSubvaults = false;
                });
            }
        });

        $scope.toggleSubvaultSelectionAll = function ($event) {
            var subvaults = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.subvaults.length; i++) {
                    subvaults[$scope.subvaults[i].id] = true;
                }
            }

            $scope.selectedSubvaults = subvaults;
        };

        $scope.toggleSubvaultSelection = function (id) {
            if (id in $scope.selectedSubvaults) {
                delete $scope.selectedSubvaults[id];
            }
            else {
                $scope.selectedSubvaults[id] = true;
            }
        };

        $scope.subvaultSelected = function (subvault) {
            return subvault.id in $scope.selectedSubvaults;
        };

        $scope.allSelected = function () {
            return Object.keys($scope.selectedSubvaults).length === $scope.subvaults.length;
        };

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            $scope.login.organizationId = model.organizationId;

            var request = {
                subvaultIds: [],
                cipher: cipherService.encryptLogin($scope.login)
            };

            for (var id in $scope.selectedSubvaults) {
                if ($scope.selectedSubvaults.hasOwnProperty(id)) {
                    request.subvaultIds.push(id);
                }
            }

            $scope.submitPromise = apiService.ciphers.move({ id: loginId }, request, function (response) {
                $analytics.eventTrack('Shared Login');
                $uibModalInstance.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
