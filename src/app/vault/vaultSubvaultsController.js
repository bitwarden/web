angular
    .module('bit.vault')

    .controller('vaultCollectionsController', function ($scope, apiService, cipherService, $analytics, $q, $localStorage,
        $uibModal, $filter, $rootScope) {
        $scope.logins = [];
        $scope.collections = [];
        $scope.loading = true;

        $scope.$on('$viewContentLoaded', function () {
            var collectionPromise = apiService.collections.listMe({}, function (collections) {
                var decCollections = [];

                for (var i = 0; i < collections.Data.length; i++) {
                    var decCollection = cipherService.decryptCollection(collections.Data[i], null, true);
                    decCollection.collapsed = $localStorage.collapsedCollections &&
                        decCollection.id in $localStorage.collapsedCollections;
                    decCollections.push(decCollection);
                }

                $scope.collections = decCollections;
            }).$promise;

            var cipherPromise = apiService.ciphers.listDetails({}, function (ciphers) {
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
                return cipher.collectionIds.indexOf(collection.id) > -1;
            };
        };

        $scope.collapseExpand = function (collection) {
            if (!$localStorage.collapsedCollections) {
                $localStorage.collapsedCollections = {};
            }

            if (collection.id in $localStorage.collapsedCollections) {
                delete $localStorage.collapsedCollections[collection.id];
            }
            else {
                $localStorage.collapsedCollections[collection.id] = true;
            }
        };

        $scope.editLogin = function (login) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditLogin.html',
                controller: 'vaultEditLoginController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            editModel.result.then(function (returnVal) {
                var rootLogin = findRootLogin(login) || {};

                if (returnVal.action === 'edit') {
                    login.folderId = rootLogin.folderId = returnVal.data.folderId;
                    login.name = rootLogin.name = returnVal.data.name;
                    login.username = rootLogin.username = returnVal.data.username;
                    login.favorite = rootLogin.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'partialEdit') {
                    login.folderId = rootLogin.folderId = returnVal.data.folderId;
                    login.favorite = rootLogin.favorite = returnVal.data.favorite;
                }
                else if (returnVal.action === 'delete') {
                    var index = $scope.logins.indexOf(login);
                    if (index > -1) {
                        $scope.logins.splice(index, 1);
                    }

                    removeRootLogin(rootLogin);
                }
            });
        };

        $scope.editCollections = function (login) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultLoginCollections.html',
                controller: 'vaultLoginCollectionsController',
                resolve: {
                    loginId: function () { return login.id; }
                }
            });

            modal.result.then(function (response) {
                if (response.collectionIds) {
                    login.collectionIds = response.collectionIds;

                    if (!response.collectionIds.length) {
                        removeRootLogin(findRootLogin(login));
                    }
                }
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
                $analytics.eventTrack('Removed From Collection');
                login.collectionIds = request.collectionIds;
                if (!login.collectionIds.length) {
                    removeRootLogin(findRootLogin(login));
                }
            });
        };

        function findRootLogin(login) {
            if ($rootScope.vaultLogins) {
                var rootLogins = $filter('filter')($rootScope.vaultLogins, { id: login.id });
                if (rootLogins && rootLogins.length) {
                    return rootLogins[0];
                }
            }

            return null;
        }

        function removeRootLogin(rootLogin) {
            if (rootLogin && rootLogin.id) {
                var index = $rootScope.vaultLogins.indexOf(rootLogin);
                if (index > -1) {
                    $rootScope.vaultLogins.splice(index, 1);
                }
            }
        }
    });
