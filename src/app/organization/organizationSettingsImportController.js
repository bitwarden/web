angular
    .module('bit.organization')

    .controller('organizationSettingsImportController', function ($scope, $state, apiService, $uibModalInstance, cipherService,
        toastr, importService, $analytics, $sce, validationService, cryptoService) {
        $analytics.eventTrack('organizationSettingsImportController', { category: 'Modal' });
        $scope.model = { source: '' };
        $scope.source = {};
        $scope.splitFeatured = false;

        $scope.options = [
            {
                id: 'bitwardencsv',
                name: 'bitwarden (csv)',
                featured: true,
                sort: 1,
                instructions: $sce.trustAsHtml('Export using the web vault (vault.bitwarden.com). ' +
                    'Log into the web vault and navigate to your organization\'s admin area. Then to go ' +
                    '"Settings" > "Tools" > "Export".')
            },
            {
                id: 'lastpass',
                name: 'LastPass (csv)',
                featured: true,
                sort: 2,
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/article/import-from-lastpass/">' +
                    'https://help.bitwarden.com/article/import-from-lastpass/</a>')
            }
        ];

        $scope.setSource = function () {
            for (var i = 0; i < $scope.options.length; i++) {
                if ($scope.options[i].id === $scope.model.source) {
                    $scope.source = $scope.options[i];
                    break;
                }
            }
        };
        $scope.setSource();

        $scope.import = function (model, form) {
            if (!model.source || model.source === '') {
                validationService.addError(form, 'source', 'Select the format of the import file.', true);
                return;
            }

            var file = document.getElementById('file').files[0];
            if (!file && (!model.fileContents || model.fileContents === '')) {
                validationService.addError(form, 'file', 'Select the import file or copy/paste the import file contents.', true);
                return;
            }

            $scope.processing = true;
            importService.importOrg(model.source, file || model.fileContents, importSuccess, importError);
        };

        function importSuccess(collections, ciphers, collectionRelationships) {
            if (!collections.length && !ciphers.length) {
                importError('Nothing was imported.');
                return;
            }
            else if (ciphers.length) {
                var halfway = Math.floor(ciphers.length / 2);
                var last = ciphers.length - 1;
                if (cipherIsBadData(ciphers[0]) && cipherIsBadData(ciphers[halfway]) && cipherIsBadData(ciphers[last])) {
                    importError('CSV data is not formatted correctly. Please check your import file and try again.');
                    return;
                }
            }

            apiService.ciphers.importOrg({ orgId: $state.params.orgId }, {
                collections: cipherService.encryptCollections(collections, $state.params.orgId),
                ciphers: cipherService.encryptCiphers(ciphers, cryptoService.getOrgKey($state.params.orgId)),
                collectionRelationships: collectionRelationships
            }, function () {
                $uibModalInstance.dismiss('cancel');
                $state.go('backend.org.vault', { orgId: $state.params.orgId }).then(function () {
                    $analytics.eventTrack('Imported Org Data', { label: $scope.model.source });
                    toastr.success('Data has been successfully imported into your vault.', 'Import Success');
                });
            }, importError);
        }

        function cipherIsBadData(cipher) {
            return (cipher.name === null || cipher.name === '--') &&
                (cipher.login && (cipher.login.password === null || cipher.login.password === ''));
        }

        function importError(error) {
            $analytics.eventTrack('Import Org Data Failed', { label: $scope.model.source });
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
