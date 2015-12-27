angular
    .module('bit.tools')

    .controller('toolsImportController', function ($scope, $state, apiService, $uibModalInstance, cryptoService, cipherService, toastr) {
        $scope.model = { source: 'local' };

        $scope.import = function (model) {
            var file = document.getElementById('file').files[0];

            // local
            if (model.source == 'local') {
                Papa.parse(file, {
                    header: true,
                    complete: function (results) {
                        console.log(results);
                    }
                });
            } // lastpass
            else if (model.source == 'lastpass') {
                Papa.parse(file, {
                    header: true,
                    complete: function (results) {
                        var folders = [],
                            sites = [],
                            siteRelationships = [];

                        angular.forEach(results.data, function (value, key) {
                            if (!value.url || value.url === '') {
                                return;
                            }

                            var folderIndex = folders.length,
                                siteIndex = sites.length,
                                hasFolder = value.grouping && value.grouping !== '' && value.grouping != '(none)',
                                addFolder = hasFolder;

                            if (hasFolder) {
                                for (var i = 0; i < folders.length; i++) {
                                    if (folders[i].name == value.grouping) {
                                        addFolder = false;
                                        folderIndex = i;
                                        break;
                                    }
                                }
                            }

                            sites.push({
                                uri: value.url,
                                username: value.username && value.username !== '' ? value.username : null,
                                password: value.password,
                                notes: value.extra && value.extra !== '' ? value.extra : null,
                                name: value.name
                            });

                            if (addFolder) {
                                folders.push({
                                    name: value.grouping
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: siteIndex,
                                    value: folderIndex
                                };
                                siteRelationships.push(relationship);
                            }
                        });

                        doImport(folders, sites, siteRelationships);
                    }
                });
            }
            else {
                // source not supported
            }
        };

        function doImport(folders, sites, siteRelationships) {
            $scope.importPromise = apiService.tools.import({
                folders: cipherService.encryptFolders(folders, cryptoService.getKey()),
                sites: cipherService.encryptSites(sites, cryptoService.getKey()),
                siteRelationships: siteRelationships
            }, function () {
                $uibModalInstance.dismiss('cancel');
                $state.go('backend.vault').then(function () {
                    toastr.success('Data has been successfully imported into your vault.', 'Import Success');
                });
            }, function () {
                $uibModalInstance.dismiss('cancel');
                toastr.error('Something went wrong.', 'Oh No!');
            }).$promise;
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
