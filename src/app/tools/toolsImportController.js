angular
    .module('bit.tools')

    .controller('toolsImportController', function ($scope, $state, apiService, $uibModalInstance, cryptoService, cipherService,
        toastr, importService, $analytics, $sce, validationService) {
        $analytics.eventTrack('toolsImportController', { category: 'Modal' });
        $scope.model = { source: '' };
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
                    'Password Exporter</a> addon for FireFox to export your passwords to a XML file. After installing ' +
                    'the addon, type <code>about:addons</code> in your FireFox navigation bar. Locate the Password Exporter ' +
                    'addon and click the "Options" button. In the dialog that pops up, click the "Export Passwords" button ' +
                    'to save the XML file.')
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
                id: '1password1pif',
                name: '1Password (1pif)',
                instructions: $sce.trustAsHtml('See detailed instructions on our help site at ' +
                    '<a target="_blank" href="https://help.bitwarden.com/getting-started/import-from-1password/">' +
                    'https://help.bitwarden.com/getting-started/import-from-1password/</a>')
            },
            {
                id: '1password6wincsv',
                name: '1Password 6 Windows (csv)',
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
                id: 'truekeycsv',
                name: 'True Key (csv)',
                instructions: $sce.trustAsHtml('Using the True Key desktop application, click the gear icon (top right) and ' +
                    'then navigate to "App Settings". Click the "Export" button, enter your password and save the CSV file.')
            },
            {
                id: 'passwordbossjson',
                name: 'Password Boss (json)',
                instructions: $sce.trustAsHtml('Using the Password Boss desktop application, navigate to "File" > ' +
                    '"Export data" > "Password Boss JSON - not encrypted" and save the JSON file.')
            },
            {
                id: 'zohovaultcsv',
                name: 'Zoho Vault (csv)',
                instructions: $sce.trustAsHtml('Log into the Zoho web vault (vault.zoho.com). Navigate to "Tools" > ' +
                    '"Export Secrets". Select "All Secrets" and click the "Zoho Vault Format CSV" button. Highlight ' +
                    'and copy the data from the textarea. Open a text editor like Notepad and paste the data. Save the ' +
                    'data from the text editor as <code>zoho_export.csv</code>.')
            },
            {
                id: 'splashidcsv',
                name: 'SplashID (csv)',
                instructions: $sce.trustAsHtml('Using the SplashID Safe desktop application, click on the SplashID ' +
                    'blue lock logo in the top right corner. Navigate to "Export" > "Export as CSV" and save the CSV file.')
            },
            {
                id: 'passworddragonxml',
                name: 'Password Dragon (xml)',
                instructions: $sce.trustAsHtml('Using the Password Dragon desktop application, navigate to "File" > ' +
                    '"Export" > "To XML". In the dialog that pops up select "All Rows" and check all fields. Click ' +
                    'the "Export" button and save the XML file.')
            },
            {
                id: 'padlockcsv',
                name: 'Padlock (csv)',
                instructions: $sce.trustAsHtml('Using the Padlock desktop application, click the hamburger icon ' +
                    'in the top left corner and navigate to "Settings". Click the "Export Data" option. Ensure that ' +
                    'the "CSV" option is selected from the dropdown. Highlight and copy the data from the textarea. ' +
                    'Open a text editor like Notepad and paste the data. Save the data from the text editor as ' +
                    '<code>padlock_export.csv</code>.')
            },
            {
                id: 'clipperzhtml',
                name: 'Clipperz (html)',
                instructions: $sce.trustAsHtml('Log into the Clipperz web application (clipperz.is/app). Click the ' +
                    'hamburger menu icon in the top right to expand the navigation bar. Navigate to "Data" > ' +
                    '"Export". Click the "download HTML+JSON" button to save the HTML file.')
            },
            {
                id: 'avirajson',
                name: 'Avira (json)',
                instructions: $sce.trustAsHtml('Using the Avira browser extension, click your username in the top ' +
                    'right corner and navigate to "Settings". Locate the "Export Data" section and click "Export". ' +
                    'In the dialog that pops up, click the "Export Password Manager Data" button to save the ' +
                    'TXT/JSON file.')
            },
            {
                id: 'saferpasscsv',
                name: 'SaferPass (csv)',
                instructions: $sce.trustAsHtml('Using the SaferPass browser extension, click the hamburger icon ' +
                    'in the top left corner and navigate to "Settings". Click the "Export accounts" button to ' +
                    'save the CSV file.')
            },
            {
                id: 'upmcsv',
                name: 'Universal Password Manager (csv)',
                instructions: $sce.trustAsHtml('Using the Universal Password Manager desktop application, navigate ' +
                    'to "Database" > "Export" and save the CSV file.')
            },
            {
                id: 'ascendocsv',
                name: 'Ascendo DataVault (csv)',
                instructions: $sce.trustAsHtml('Using the Ascendo DataVault desktop application, navigate ' +
                    'to "Tools" > "Export". In the dialog that pops up, select the "All Items (DVX, CSV)" ' +
                    'option. Click the "Ok" button to save the CSV file.')
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
            importService.import(model.source, file || model.fileContents, importSuccess, importError);
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
                folders: cipherService.encryptFolders(folders),
                logins: cipherService.encryptLogins(logins),
                folderRelationships: folderRelationships
            }, function () {
                $uibModalInstance.dismiss('cancel');
                $state.go('backend.user.vault', { refreshFromServer: true }).then(function () {
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
