angular
    .module('bit.vault')

    .controller('vaultShareCipherController', function ($scope, apiService, $uibModalInstance, authService, cipherService,
        cipherId, $analytics, $state, cryptoService, $q, toastr) {
        $analytics.eventTrack('vaultShareCipherController', { category: 'Modal' });
        $scope.model = {};
        $scope.cipher = {};
        $scope.collections = [];
        $scope.selectedCollections = {};
        $scope.organizations = [];
        var organizationCollectionCounts = {};
        $scope.loadingCollections = true;
        $scope.loading = true;
        $scope.readOnly = false;

        apiService.ciphers.get({ id: cipherId }).$promise.then(function (cipher) {
            $scope.readOnly = !cipher.Edit;
            if (cipher.Edit) {
                $scope.cipher = cipherService.decryptCipher(cipher);
            }

            return cipher.Edit;
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

                apiService.collections.listMe({ writeOnly: true }, function (response) {
                    var collections = [];
                    for (var i = 0; i < response.Data.length; i++) {
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
                    if ($scope.model.organizationId && $scope.collections[i].organizationId === $scope.model.organizationId) {
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

            var errorOnUpload = false;
            var attachmentSharePromises = [];
            if ($scope.cipher.attachments) {
                for (var i = 0; i < $scope.cipher.attachments.length; i++) {
                    (function (attachment) {
                        var promise = cipherService.downloadAndDecryptAttachment(null, attachment, false)
                            .then(function (decData) {
                                return cryptoService.encryptToBytes(decData.buffer, orgKey);
                            }).then(function (encData) {
                                if (errorOnUpload) {
                                    return;
                                }

                                var fd = new FormData();
                                var blob = new Blob([encData], { type: 'application/octet-stream' });
                                var encFilename = cryptoService.encrypt(attachment.fileName, orgKey);
                                fd.append('data', blob, encFilename);

                                return apiService.ciphers.postShareAttachment({
                                    id: cipherId,
                                    attachmentId: attachment.id,
                                    orgId: model.organizationId
                                }, fd).$promise;
                            }, function (err) {
                                errorOnUpload = true;
                            });
                        attachmentSharePromises.push(promise);
                    })($scope.cipher.attachments[i]);
                }
            }

            $scope.submitPromise = $q.all(attachmentSharePromises).then(function () {
                if (errorOnUpload) {
                    return;
                }

                $scope.cipher.organizationId = model.organizationId;

                var request = {
                    collectionIds: [],
                    cipher: cipherService.encryptCipher($scope.cipher, $scope.cipher.type, null, true)
                };

                for (var id in $scope.selectedCollections) {
                    if ($scope.selectedCollections.hasOwnProperty(id)) {
                        request.collectionIds.push(id);
                    }
                }

                return apiService.ciphers.putShare({ id: cipherId }, request).$promise;
            }).then(function (response) {
                $analytics.eventTrack('Shared Cipher');
                toastr.success('Item has been shared.');
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
