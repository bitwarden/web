angular
    .module('bit.tools')

    .controller('toolsImportController', function ($scope, $state, apiService, $uibModalInstance, cryptoService, cipherService, toastr, importService, $analytics, $sce) {
        $analytics.eventTrack('toolsImportController', { category: 'Modal' });
        $scope.model = { source: 'bitwardencsv' };
        $scope.source = {};

        $scope.options = [
            {
                id: 'bitwardencsv',
                name: 'bitwarden (csv)',
                instructions: $sce.trustAsHtml('Export using the web vault (vault.bitwarden.com). ' +
                    'Log into the web vault and navigate to "Tools" > "Export".')
            },
            {
                id: 'lastpass',
                name: 'LastPass (csv)',
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/getting-started/import-from-lastpass/">' +
                    'https://help.bitwarden.com/getting-started/import-from-lastpass/</a>')
            },
            {
                id: 'chromecsv',
                name: 'Chrome (csv)',
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/getting-started/import-from-chrome/">' +
                    'https://help.bitwarden.com/getting-started/import-from-chrome/</a>')
            },
            {
                id: 'firefoxpasswordexportercsvxml',
                name: 'Firefox Password Exporter (xml)',
                instructions: $sce.trustAsHtml('Use the ' +
                    '<a target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/password-exporter/">' +
                    'Password Exporter</a> addon for FireFox to export your passwords to an XML file.')
            },
            {
                id: 'keepass2xml',
                name: 'KeePass 2 (xml)',
                instructions: $sce.trustAsHtml('Using the KeePass 2 desktop application, navigate to "File" > "Export" and ' +
                    'select the KeePass XML (2.x) option.')
            },
            {
                id: 'keepassxcsv',
                name: 'KeePassX (csv)',
                instructions: $sce.trustAsHtml('Using the KeePassX desktop application, navigate to "Database" > ' +
                    '"Export to CSV file" and save the CSV file.')
            },
            {
                id: 'dashlanecsv',
                name: 'Dashlane (csv)',
                instructions: $sce.trustAsHtml('Using the Dashlane desktop application, navigate to "File" > "Export" > ' +
                    '"Unsecured archive (readable) in CSV format" and save the CSV file.')
            },
            {
                id: '1password41pif',
                name: '1Password 4 (1pif)',
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/getting-started/import-from-1password/">' +
                    'https://help.bitwarden.com/getting-started/import-from-1password/</a>')
            },
            {
                id: '1password6csv',
                name: '1Password 6 (csv)',
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/getting-started/import-from-1password/">' +
                    'https://help.bitwarden.com/getting-started/import-from-1password/</a>')
            },
            {
                id: 'roboformhtml',
                name: 'RoboForm (html)',
                instructions: $sce.trustAsHtml('Using the RoboForm Editor desktop application, navigate to "RoboForm" ' +
                    '(top left) > "Print List" > "Logins". When the following print dialog pops up click on the "Save" button ' +
                    'and save the HTML file.')
            },
            {
                id: 'keepercsv',
                name: 'Keeper (csv)',
                instructions: $sce.trustAsHtml('Log into the Keeper web vault (keepersecurity.com/vault). Navigate to "Backup" ' +
                    '(top right) and find the "Export to Text File" option. Click "Export Now" to save the TXT/CSV file.')
            },
            {
                id: 'enpasscsv',
                name: 'Enpass (csv)',
                instructions: $sce.trustAsHtml('Using the Enpass desktop application, navigate to "File" > "Export" > ' +
                    '"As CSV". Select "Yes" to the warning alert and save the CSV file.')
            },
            {
                id: 'safeincloudxml',
                name: 'SafeInCloud (xml)',
                instructions: $sce.trustAsHtml('Using the SaveInCloud desktop application, navigate to "File" > "Export" > ' +
                    '"As XML" and save the XML file.')
            },
            {
                id: 'pwsafexml',
                name: 'Password Safe (xml)',
                instructions: $sce.trustAsHtml('Using the Password Safe desktop application, navigate to "File" > ' +
                    '"Export To" > "XML format..." and save the XML file.')
            },
            {
                id: 'stickypasswordxml',
                name: 'Sticky Password (xml)',
                instructions: $sce.trustAsHtml('Using the Sticky Password desktop application, navigate to "Menu" ' +
                    '(top right) > "Export" > "Export all". Select the unencrypted format XML option and then the ' +
                    '"Save to file" button. Save the XML file.')
            },
            {
                id: 'msecurecsv',
                name: 'mSecure (csv)',
                instructions: $sce.trustAsHtml('Using the mSecure desktop application, navigate to "File" > ' +
                    '"Export" > "CSV File..." and save the CSV file.')
            },
            {
                id: 'truekeyjson',
                name: 'True Key (json)',
                instructions: $sce.trustAsHtml('Using the True Key desktop application, click the gear icon (top right) and ' +
                    'then navigate to "App Settings". Click the "Export" button and save the JSON file.')
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
