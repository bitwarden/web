angular
    .module('bit.organization')

    .controller('organizationVaultController', function ($scope, apiService, cipherService, $analytics, $q, $state,
        $localStorage, $uibModal, $filter, authService, $uibModalStack, constants, $timeout) {
        $scope.ciphers = [];
        $scope.collections = [];
        $scope.loading = true;
        $scope.useEvents = false;
        $scope.constants = constants;
        $scope.filter = undefined;
        $scope.selectedType = undefined;
        $scope.selectedCollection = undefined;
        $scope.selectedAll = true;
        $scope.selectedTitle = 'All';
        $scope.selectedIcon = 'fa-th';

        $scope.$on('$viewContentLoaded', function () {
            authService.getUserProfile().then(function (profile) {
                if (profile.organizations) {
                    var org = profile.organizations[$state.params.orgId];
                    $scope.useEvents = !!org.useEvents;
                }
            });

            var collectionPromise = apiService.collections.listOrganization({ orgId: $state.params.orgId }, function (collections) {
                var decCollections = [{
                    id: null,
                    name: 'Unassigned'
                }];

                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollections.push(decCollection);
                }

                $scope.collections = decCollections;
            }).$promise;

            var cipherPromise = apiService.ciphers.listOrganizationDetails({ organizationId: $state.params.orgId },
                function (ciphers) {
                    var decCiphers = [];

                    for (var i = 0; i < ciphers.Data.length; i++) {
                        var decCipher = cipherService.decryptCipherPreview(ciphers.Data[i]);
                        decCiphers.push(decCipher);
                    }

                    $scope.ciphers = decCiphers;
                }).$promise;

            $q.all([collectionPromise, cipherPromise]).then(function () {
                $scope.loading = false;
                $("#search").focus();

                if ($state.params.search) {
                    $uibModalStack.dismissAll();
                    $scope.searchVaultText = $state.params.search;
                }

                if ($state.params.viewEvents) {
                    $uibModalStack.dismissAll();
                    var cipher = $filter('filter')($scope.ciphers, { id: $state.params.viewEvents });
                    if (cipher && cipher.length) {
                        $scope.viewEvents(cipher[0]);
                    }
                }
            });
        });

        $scope.collectionSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.editCipher = function (cipher) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditCipher.html',
                controller: 'organizationVaultEditCipherController',
                resolve: {
                    cipherId: function () { return cipher.id; },
                    orgId: function () { return $state.params.orgId; }
                }
            });

            editModel.result.then(function (returnVal) {
                var index;
                if (returnVal.action === 'edit') {
                    index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        returnVal.data.collectionIds = $scope.ciphers[index].collectionIds;
                        $scope.ciphers[index] = returnVal.data;
                    }
                }
                else if (returnVal.action === 'delete') {
                    index = $scope.ciphers.indexOf(cipher);
                    if (index > -1) {
                        $scope.ciphers.splice(index, 1);
                    }
                }
            });
        };

        $scope.$on('organizationVaultAddCipher', function (event, args) {
            $scope.addCipher();
        });

        $scope.addCipher = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddCipher.html',
                controller: 'organizationVaultAddCipherController',
                resolve: {
                    orgId: function () { return $state.params.orgId; },
                    selectedType: function () { return $scope.selectedType; }
                }
            });

            addModel.result.then(function (addedCipher) {
                $scope.ciphers.push(addedCipher);
            });
        };

        $scope.editCollections = function (cipher) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationVaultCipherCollections.html',
                controller: 'organizationVaultCipherCollectionsController',
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

        $scope.viewEvents = function (cipher) {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationVaultCipherEvents.html',
                controller: 'organizationVaultCipherEventsController',
                resolve: {
                    cipher: function () { return cipher; }
                }
            });
        };

        $scope.attachments = function (cipher) {
            authService.getUserProfile().then(function (profile) {
                return !!profile.organizations[cipher.organizationId].maxStorageGb;
            }).then(function (useStorage) {
                if (!useStorage) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'app/views/paidOrgRequired.html',
                        controller: 'paidOrgRequiredController',
                        resolve: {
                            orgId: function () { return cipher.organizationId; }
                        }
                    });
                    return;
                }

                var attachmentModel = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/vault/views/vaultAttachments.html',
                    controller: 'organizationVaultAttachmentsController',
                    resolve: {
                        cipherId: function () { return cipher.id; }
                    }
                });

                attachmentModel.result.then(function (hasAttachments) {
                    cipher.hasAttachments = hasAttachments;
                });
            });
        };

        $scope.deleteCipher = function (cipher) {
            if (!confirm('Are you sure you want to delete this item (' + cipher.name + ')?')) {
                return;
            }

            apiService.ciphers.delAdmin({ id: cipher.id }, function () {
                $analytics.eventTrack('Deleted Cipher');
                var index = $scope.ciphers.indexOf(cipher);
                if (index > -1) {
                    $scope.ciphers.splice(index, 1);
                }
            });
        };

        $scope.filterCollection = function (col) {
            resetSelected();
            $scope.selectedCollection = col;
            $scope.selectedIcon = 'fa-cube';
            $scope.filter = function (c) {
                return c.collectionIds && c.collectionIds.indexOf(col.id) > -1;
            };
            fixLayout();
        };

        $scope.filterType = function (t) {
            resetSelected();
            $scope.selectedType = t;
            switch (t) {
                case constants.cipherType.login:
                    $scope.selectedTitle = 'Login';
                    $scope.selectedIcon = 'fa-globe';
                    break;
                case constants.cipherType.card:
                    $scope.selectedTitle = 'Card';
                    $scope.selectedIcon = 'fa-credit-card';
                    break;
                case constants.cipherType.identity:
                    $scope.selectedTitle = 'Identity';
                    $scope.selectedIcon = 'fa-id-card-o';
                    break;
                case constants.cipherType.secureNote:
                    $scope.selectedTitle = 'Secure Note';
                    $scope.selectedIcon = 'fa-sticky-note-o';
                    break;
                default:
                    break;
            }
            $scope.filter = function (c) {
                return c.type === t;
            };
            fixLayout();
        };

        $scope.filterAll = function () {
            resetSelected();
            $scope.selectedAll = true;
            $scope.selectedTitle = 'All';
            $scope.selectedIcon = 'fa-th';
            $scope.filter = null;
            fixLayout();
        };

        function resetSelected() {
            $scope.selectedCollection = undefined;
            $scope.selectedType = undefined;
            $scope.selectedAll = false;
        }

        function fixLayout() {
            if ($.AdminLTE && $.AdminLTE.layout) {
                $timeout(function () {
                    $.AdminLTE.layout.fix();
                }, 0);
            }
        }

        $scope.cipherFilter = function () {
            return function (cipher) {
                return !$scope.filter || $scope.filter(cipher);
            };
        };
    });
