angular
    .module('bit.vault')

    .controller('vaultShareLoginController', function ($scope, apiService, $uibModalInstance, authService, cipherService,
        loginId, $analytics, $state, cryptoService, $q) {
        $analytics.eventTrack('vaultShareLoginController', { category: 'Modal' });
        $scope.model = {};
        $scope.login = {};
        $scope.collections = [];
        $scope.selectedCollections = {};
        $scope.organizations = [];
        var organizationCollectionCounts = {};
        $scope.loadingCollections = true;
        $scope.loading = true;
        $scope.readOnly = false;

        apiService.logins.get({ id: loginId }).$promise.then(function (login) {
            $scope.readOnly = !login.Edit;
            if (login.Edit) {
                $scope.login = cipherService.decryptLogin(login);
            }

            return login.Edit;
        }).then(function (canEdit) {
            $scope.loading = false;
            if (!canEdit) {
                return;
            }

            return authService.getUserProfile();
        }).then(function (profile) {
            if (profile && profile.organizations) {
                var orgs = [],
                    setFirstOrg = false;

                for (var i in profile.organizations) {
                    if (profile.organizations.hasOwnProperty(i) && profile.organizations[i].enabled) {
                        orgs.push({
                            id: profile.organizations[i].id,
                            name: profile.organizations[i].name
                        });

                        organizationCollectionCounts[profile.organizations[i].id] = 0;

                        if (!setFirstOrg) {
                            setFirstOrg = true;
                            $scope.model.organizationId = profile.organizations[i].id;
                        }
                    }
                }

                $scope.organizations = orgs;

                apiService.collections.listMe(function (response) {
                    var collections = [];
                    for (var i = 0; i < response.Data.length; i++) {
                        if (response.Data[i].ReadOnly) {
                            continue;
                        }

                        var decCollection = cipherService.decryptCollection(response.Data[i]);
                        decCollection.organizationId = response.Data[i].OrganizationId;
                        collections.push(decCollection);
                        organizationCollectionCounts[decCollection.organizationId]++;
                    }

                    $scope.collections = collections;
                    $scope.loadingCollections = false;
                });
            }
        });

        $scope.toggleCollectionSelectionAll = function ($event) {
            var collections = {};
            if ($event.target.checked) {
                for (var i = 0; i < $scope.collections.length; i++) {
                    if ($scope.model.organizationId && $scope.collections[i].organizationId === $scope.model.organizationId &&
                        !$scope.collections[i].readOnly) {
                        collections[$scope.collections[i].id] = true;
                    }
                }
            }

            $scope.selectedCollections = collections;
        };

        $scope.toggleCollectionSelection = function (id) {
            if (id in $scope.selectedCollections) {
                delete $scope.selectedCollections[id];
            }
            else {
                $scope.selectedCollections[id] = true;
            }
        };

        $scope.collectionSelected = function (collection) {
            return collection.id in $scope.selectedCollections;
        };

        $scope.allSelected = function () {
            if (!$scope.model.organizationId) {
                return false;
            }

            return Object.keys($scope.selectedCollections).length === organizationCollectionCounts[$scope.model.organizationId];
        };

        $scope.orgChanged = function () {
            $scope.selectedCollections = {};
        };

        $scope.submitPromise = null;
        $scope.submit = function (model) {
            var orgKey = cryptoService.getOrgKey(model.organizationId);

            var attachmentSharePromises = [];
            if ($scope.login.attachments) {
                for (var i = 0; i < $scope.login.attachments.length; i++) {
                    var attachment = $scope.login.attachments[i];
                    var promise = cipherService.downloadAndDecryptAttachment(null, attachment, false)
                        .then(function (decData) {
                            return cryptoService.encryptToBytes(decData.buffer, orgKey);
                        }).then(function (encData) {
                            var fd = new FormData();
                            var blob = new Blob([encData], { type: 'application/octet-stream' });
                            var encFilename = cryptoService.encrypt(attachment.fileName, orgKey);
                            fd.append('data', blob, encFilename);

                            return apiService.ciphers.postShareAttachment({
                                id: loginId,
                                attachmentId: attachment.id,
                                orgId: model.organizationId
                            }, fd).$promise;
                        });
                    attachmentSharePromises.push(promise);
                }
            }

            $scope.submitPromise = $q.all(attachmentSharePromises).then(function () {
                $scope.login.organizationId = model.organizationId;

                var request = {
                    collectionIds: [],
                    cipher: cipherService.encryptLogin($scope.login, null, true)
                };

                for (var id in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(id)) {
                        request.collectionIds.push(id);
                    }
                }

                return apiService.ciphers.putShare({ id: loginId }, request).$promise;
            }).then(function (response) {
                $analytics.eventTrack('Shared Login');
                $uibModalInstance.close(model.organizationId);
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.createOrg = function () {
            $state.go('backend.user.settingsCreateOrg').then(function () {
                $uibModalInstance.dismiss('cancel');
            });
        };
    });
