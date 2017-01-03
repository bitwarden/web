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

        function importSuccess(folders, logins, folderRelationships) {
            if (!folders.length && !logins.length) {
                importError('Nothing was imported.');
                return;
            }
            else if (logins.length) {
                var halfway = Math.floor(logins.length / 2);
                var last = logins.length - 1;
                if (loginIsBadData(logins[0]) && loginIsBadData(logins[halfway]) && loginIsBadData(logins[last])) {
                    importError('CSV data is not formatted correctly. Please check your import file and try again.');
                    return;
                }
            }

            apiService.ciphers.import({
                folders: cipherService.encryptFolders(folders, cryptoService.getKey()),
                logins: cipherService.encryptLogins(logins, cryptoService.getKey()),
                folderRelationships: folderRelationships
            }, function () {
                $uibModalInstance.dismiss('cancel');
                $state.go('backend.vault').then(function () {
                    $analytics.eventTrack('Imported Data', { label: $scope.model.source });
                    toastr.success('Data has been successfully imported into your vault.', 'Import Success');
                });
            }, importError);
        }

        function loginIsBadData(login) {
            return (login.name === null || login.name === '--') && (login.password === null || login.password === '');
        }

        function importError(error) {
            $analytics.eventTrack('Import Data Failed', { label: $scope.model.source });
            $uibModalInstance.dismiss('cancel');

            if (error) {
                var data = error.data;
                if (data && data.ValidationErrors) {
                    var message = '';
                    for (var key in data.ValidationErrors) {
                        if (!data.ValidationErrors.hasOwnProperty(key)) {
                            continue;
                        }

                        for (var i = 0; i < data.ValidationErrors[key].length; i++) {
                            message += (key + ': ' + data.ValidationErrors[key][i] + ' ');
                        }
                    }

                    if (message !== '') {
                        toastr.error(message);
                        return;
                    }
                }
                else if (data && data.Message) {
                    toastr.error(data.Message);
                    return;
                }
                else {
                    toastr.error(error);
                    return;
                }
            }

            toastr.error('Something went wrong. Try again.', 'Oh No!');
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
