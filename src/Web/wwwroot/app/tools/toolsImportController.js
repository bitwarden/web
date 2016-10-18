angular
    .module('bit.tools')

    .controller('toolsImportController', function ($scope, $state, apiService, $uibModalInstance, cryptoService, cipherService, toastr, importService, $analytics) {
        $analytics.eventTrack('toolsImportController', { category: 'Modal' });
        $scope.model = { source: 'local' };

        $scope.import = function (model) {
            $scope.processing = true;
            var file = document.getElementById('file').files[0];
            importService.import(model.source, file, importSuccess, importError);
        };

        function importSuccess(folders, sites, folderRelationships) {
            if (!folder.length && !sites.length) {
                toastr.error('Nothing was imported.');
                return;
            }

            apiService.ciphers.import({
                folders: cipherService.encryptFolders(folders, cryptoService.getKey()),
                sites: cipherService.encryptSites(sites, cryptoService.getKey()),
                folderRelationships: folderRelationships
            }, function () {
                $uibModalInstance.dismiss('cancel');
                $state.go('backend.vault').then(function () {
                    $analytics.eventTrack('Imported Data', { label: $scope.model.source });
                    toastr.success('Data has been successfully imported into your vault.', 'Import Success');
                });
            }, importError);
        }

        function importError(errorMessage) {
            $analytics.eventTrack('Import Data Failed', { label: $scope.model.source });
            $uibModalInstance.dismiss('cancel');
            if (errorMessage) {
                toastr.error(errorMessage);
            }
            else {
                toastr.error('Something went wrong. Try again.', 'Oh No!');
            }
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
