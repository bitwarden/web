angular
    .module('bit.organization')

    .controller('organizationVaultController', function ($scope, apiService, cipherService, $analytics, $q, $state,
        $localStorage, $uibModal, $filter, authService) {
        $scope.logins = [];
        $scope.collections = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var collectionPromise = apiService.collections.listOrganization({ orgId: $state.params.orgId }, function (collections) {
                var decCollections = [{
                    id: null,
                    name: 'Unassigned',
                    collapsed: $localStorage.collapsedOrgCollections && 'unassigned' in $localStorage.collapsedOrgCollections
                }];

                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollection.collapsed = $localStorage.collapsedOrgCollections &&
                        decCollection.id in $localStorage.collapsedOrgCollections;
                    decCollections.push(decCollection);
                }

                $scope.collections = decCollections;
            }).$promise;

            var cipherPromise = apiService.ciphers.listOrganizationDetails({ organizationId: $state.params.orgId },
                function (ciphers) {
                    var decLogins = [];

                    for (var i = 0; i < ciphers.Data.length; i++) {
                        if (ciphers.Data[i].Type === 1) {
                            var decLogin = cipherService.decryptLoginPreview(ciphers.Data[i]);
                            decLogins.push(decLogin);
                        }
                    }

                    $scope.logins = decLogins;
                }).$promise;

            $q.all([collectionPromise, cipherPromise]).then(function () {
                $scope.loading = false;
            });
        });

        $scope.filterByCollection = function (collection) {
            return function (cipher) {
                if (!cipher.collectionIds || !cipher.collectionIds.length) {
                    return collection.id === null;
                }

                return cipher.collectionIds.indexOf(collection.id) > -1;
            };
        };

        $scope.collectionSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.collapseExpand = function (collection) {
            if (!$localStorage.collapsedOrgCollections) {
                $localStorage.collapsedOrgCollections = {};
            }

            var id = collection.id || 'unassigned';

            if (id in $localStorage.collapsedOrgCollections) {
                delete $localStorage.collapsedOrgCollections[id];
            }
            else {
                $localStorage.collapsedOrgCollections[id] = true;
            }
        };

        $scope.editLogin = function (login) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditLogin.html',
                controller: 'organizationVaultEditLoginController',
                resolve: {
                    loginId: function () { return login.id; },
                    orgId: function () { return $state.params.orgId; }
                }
            });

            editModel.result.then(function (returnVal) {
                if (returnVal.action === 'edit') {
                    login.name = returnVal.data.name;
                    login.username = returnVal.data.username;
                }
                else if (returnVal.action === 'delete') {
                    var index = $scope.logins.indexOf(login);
                    if (index > -1) {
                        $scope.logins.splice(index, 1);
                    }
                }
            });
        };

        $scope.$on('organizationVaultAddLogin', function (event, args) {
            $scope.addLogin();
        });

        $scope.addLogin = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddLogin.html',
                controller: 'organizationVaultAddLoginController',
                resolve: {
                    orgId: function () { return $state.params.orgId; }
                }
            });

            addModel.result.then(function (addedLogin) {
                $scope.logins.push(addedLogin);
            });
        };

        $scope.editCollections = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationVaultLoginCollections.html',
                controller: 'organizationVaultLoginCollectionsController',
                resolve: {
                    cipher: function () { return cipher; },
                    collections: function () { return $scope.collections; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds) {
                    cipher.collectionIds = response.collectionIds;
                }
            });
        };

        $scope.attachments = function (login) {
            authService.getUserProfile().then(function (profile) {
                return !!profile.organizations[login.organizationId].maxStorageGb;
            }).then(function (useStorage) {
                if (!useStorage) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'app/views/paidOrgRequired.html',
                        controller: 'paidOrgRequiredController',
                        resolve: {
                            orgId: function () { return login.organizationId; }
                        }
                    });
                    return;
                }

                var attachmentModel = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/vault/views/vaultAttachments.html',
                    controller: 'organizationVaultAttachmentsController',
                    resolve: {
                        loginId: function () { return login.id; }
                    }
                });

                attachmentModel.result.then(function (hasAttachments) {
                    login.hasAttachments = hasAttachments;
                });
            });
        };

        $scope.removeLogin = function (login, collection) {
            if (!confirm('Are you sure you want to remove this login (' + login.name + ') from the ' +
                'collection (' + collection.name + ') ?')) {
                return;
            }

            var request = {
                collectionIds: []
            };

            for (var i = 0; i < login.collectionIds.length; i++) {
                if (login.collectionIds[i] !== collection.id) {
                    request.collectionIds.push(login.collectionIds[i]);
                }
            }

            apiService.ciphers.putCollections({ id: login.id }, request).$promise.then(function (response) {
                $analytics.eventTrack('Removed Login From Collection');
                login.collectionIds = request.collectionIds;
            });
        };

        $scope.deleteLogin = function (login) {
            if (!confirm('Are you sure you want to delete this login (' + login.name + ')?')) {
                return;
            }

            apiService.ciphers.delAdmin({ id: login.id }, function () {
                $analytics.eventTrack('Deleted Login');
                var index = $scope.logins.indexOf(login);
                if (index > -1) {
                    $scope.logins.splice(index, 1);
                }
            });
        };
    });
