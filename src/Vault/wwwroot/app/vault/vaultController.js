angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $uibModal, apiService, $filter, cryptoService, authService, toastr, cipherService) {
        $scope.sites = [];
        $scope.folders = [];

        $scope.loadingSites = true;
        apiService.sites.list({}, function (sites) {
            $scope.loadingSites = false;

            var decSites = [];
            for (var i = 0; i < sites.Data.length; i++) {
                var decSite = {
                    id: sites.Data[i].Id,
                    folderId: sites.Data[i].FolderId
                };

                try { decSite.name = cryptoService.decrypt(sites.Data[i].Name); }
                catch (err) { decSite.name = '[error: cannot decrypt]'; }

                if (sites.Data[i].Username) {
                    try { decSite.username = cryptoService.decrypt(sites.Data[i].Username); }
                    catch (err) { decSite.username = '[error: cannot decrypt]'; }
                }

                decSites.push(decSite);
            }

            $scope.sites = decSites;
        }, function () {
            $scope.loadingSites = false;
        });

        $scope.loadingFolders = true;
        apiService.folders.list({}, function (folders) {
            $scope.loadingFolders = false;

            var decFolders = [{
                id: null,
                name: '(none)'
            }];

            for (var i = 0; i < folders.Data.length; i++) {
                var decFolder = {
                    id: folders.Data[i].Id
                };

                try { decFolder.name = cryptoService.decrypt(folders.Data[i].Name); }
                catch (err) { decFolder.name = '[error: cannot decrypt]'; }

                decFolders.push(decFolder);
            }

            $scope.folders = decFolders;
        }, function () {
            $scope.loadingFolders = false;
        });

        $scope.editSite = function (site) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditSite.html',
                controller: 'vaultEditSiteController',
                resolve: {
                    siteId: function () { return site.id; },
                    folders: function () { return $scope.folders; }
                }
            });

            editModel.result.then(function (editedSite) {
                var site = $filter('filter')($scope.sites, { id: editedSite.id }, true);
                if (site && site.length > 0) {
                    site[0].folderId = editedSite.folderId;
                    site[0].name = editedSite.name;
                    site[0].username = editedSite.username;
                }
            });
        };

        $scope.$on('vaultAddSite', function (event, args) {
            $scope.addSite();
        });

        $scope.addSite = function (folder) {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddSite.html',
                controller: 'vaultAddSiteController',
                resolve: {
                    folders: function () { return $scope.folders; },
                    selectedFolder: function () { return folder; }
                }
            });

            addModel.result.then(function (addedSite) {
                $scope.sites.push(addedSite);
            });
        };

        $scope.deleteSite = function (site) {
            if (!confirm('Are you sure you want to delete this site (' + site.name + ')?')) {
                return;
            }

            apiService.sites.del({ id: site.id }, function () {
                var index = $scope.sites.indexOf(site);
                $scope.sites.splice(index, 1);
            });
        };

        $scope.editFolder = function (folder) {
            var editModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultEditFolder.html',
                controller: 'vaultEditFolderController',
                size: 'sm',
                resolve: {
                    folderId: function () { return folder.id; }
                }
            });

            editModel.result.then(function (editedFolder) {
                var folder = $filter('filter')($scope.folders, { id: editedFolder.id }, true);
                if (folder && folder.length > 0) {
                    folder[0].name = editedFolder.name;
                }
            });
        };

        $scope.$on('vaultAddFolder', function (event, args) {
            $scope.addFolder();
        });

        $scope.addFolder = function () {
            var addModel = $uibModal.open({
                animation: true,
                templateUrl: 'app/vault/views/vaultAddFolder.html',
                controller: 'vaultAddFolderController',
                size: 'sm'
            });

            addModel.result.then(function (addedFolder) {
                $scope.folders.push(addedFolder);
            });
        };

        $scope.deleteFolder = function (folder) {
            if (!confirm('Are you sure you want to delete this folder (' + folder.name + ')?')) {
                return;
            }

            apiService.folders.del({ id: folder.id }, function () {
                var index = $scope.folders.indexOf(folder);
                $scope.folders.splice(index, 1);
            });
        };

        $scope.canDeleteFolder = function (folder) {
            if (!folder || !folder.id) {
                return false;
            }

            var sites = $filter('filter')($scope.sites, { folderId: folder.id });
            return sites.length === 0;
        };
    });
