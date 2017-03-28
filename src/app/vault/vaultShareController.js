angular
    .module('bit.vault')

    .controller('vaultShareController', function ($scope, apiService, $uibModalInstance, authService, cipherService, loginId, $analytics) {
        $analytics.eventTrack('vaultShareController', { category: 'Modal' });
        $scope.model = {};
        $scope.login = {};
        $scope.subvaults = [];
        $scope.organizations = [];
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
                });
            }
        });

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            $scope.login.organizationId = model.organizationId;

            var request = {
                subvaultIds: model.subvaultIds,
                cipher: cipherService.encryptLogin($scope.login)
            };

            $scope.savePromise = apiService.ciphers.move({ id: loginId }, request, function (response) {
                $analytics.eventTrack('Shared Login');
                $uibModalInstance.close();
            }).$promise;
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
