angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService, passwordService, folders, selectedFolder, $analytics) {
        $analytics.eventTrack('vaultAddSiteController', { category: 'Modal' });
        $scope.folders = folders;
        $scope.site = {
            folderId: selectedFolder ? selectedFolder.id : null
        };

        $scope.savePromise = null;
        $scope.save = function (model) {
            var site = cipherService.encryptSite(model);
            $scope.savePromise = apiService.sites.post(site, function (siteResponse) {
                $analytics.eventTrack('Created Site');
                var decSite = cipherService.decryptSite(siteResponse);
                $uibModalInstance.close(decSite);
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.site.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Add');
                $scope.site.password = passwordService.generatePassword({ length: 10, special: true });
            }
        };

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            selectPassword(e);
        };

        $scope.clipboardError = function (e, password) {
            if (password) {
                selectPassword(e);
            }
            alert('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.folderSort = function (item) {
            return item.name.toLowerCase();
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };
    });
