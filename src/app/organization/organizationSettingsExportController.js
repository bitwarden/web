angular
    .module('bit.organization')

    .controller('organizationSettingsExportController', function ($scope, apiService, $uibModalInstance, cipherService,
        $q, toastr, $analytics, $state, constants) {
        $analytics.eventTrack('organizationSettingsExportController', { category: 'Modal' });
        $scope.export = function (model) {
            $scope.startedExport = true;
            var decCiphers = [],
                decCollections = [];

            var collectionsPromise = apiService.collections.listOrganization({ orgId: $state.params.orgId },
                function (collections) {
                    decCollections = cipherService.decryptCollections(collections.Data, $state.params.orgId, true);
                }).$promise;

            var ciphersPromise = apiService.ciphers.listOrganizationDetails({ organizationId: $state.params.orgId },
                function (ciphers) {
                    decCiphers = cipherService.decryptCiphers(ciphers.Data);
                }).$promise;

            $q.all([collectionsPromise, ciphersPromise]).then(function () {
                if (!decCiphers.length) {
                    toastr.error('Nothing to export.', 'Error!');
                    $scope.close();
                    return;
                }

                var i;
                var collectionsDict = {};
                for (i = 0; i < decCollections.length; i++) {
                    collectionsDict[decCollections[i].id] = decCollections[i];
                }

                try {
                    var exportCiphers = [];
                    for (i = 0; i < decCiphers.length; i++) {
                        // only export logins and secure notes
                        if (decCiphers[i].type !== constants.cipherType.login &&
                            decCiphers[i].type !== constants.cipherType.secureNote) {
                            continue;
                        }

                        var cipher = {
                            collections: [],
                            type: null,
                            name: decCiphers[i].name,
                            notes: decCiphers[i].notes,
                            fields: null,
                            // Login props
                            login_uri: null,
                            login_username: null,
                            login_password: null,
                            login_totp: null
                        };

                        var j;
                        if (decCiphers[i].collectionIds) {
                            for (j = 0; j < decCiphers[i].collectionIds.length; j++) {
                                if (collectionsDict.hasOwnProperty(decCiphers[i].collectionIds[j])) {
                                    cipher.collections.push(collectionsDict[decCiphers[i].collectionIds[j]].name);
                                }
                            }
                        }

                        if (decCiphers[i].fields) {
                            for (j = 0; j < decCiphers[i].fields.length; j++) {
                                if (!cipher.fields) {
                                    cipher.fields = '';
                                }
                                else {
                                    cipher.fields += '\n';
                                }

                                cipher.fields += ((decCiphers[i].fields[j].name || '') + ': ' + decCiphers[i].fields[j].value);
                            }
                        }

                        switch (decCiphers[i].type) {
                            case constants.cipherType.login:
                                cipher.type = 'login';
                                cipher.login_uri = null;
                                cipher.login_username = decCiphers[i].login.username;
                                cipher.login_password = decCiphers[i].login.password;
                                cipher.login_totp = decCiphers[i].login.totp;

                                if (decCiphers[i].login.uris && decCiphers[i].login.uris.length) {
                                    cipher.login_uri = [];
                                    for (j = 0; j < decCiphers[i].login.uris.length; j++) {
                                        cipher.login_uri.push(decCiphers[i].login.uris[j].uri);
                                    }
                                }
                                break;
                            case constants.cipherType.secureNote:
                                cipher.type = 'note';
                                break;
                            default:
                                continue;
                        }

                        exportCiphers.push(cipher);
                    }

                    var csvString = Papa.unparse(exportCiphers);
                    var csvBlob = new Blob([csvString]);

                    // IE hack. ref http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveBlob(csvBlob, makeFileName());
                    }
                    else {
                        var a = window.document.createElement('a');
                        a.href = window.URL.createObjectURL(csvBlob, { type: 'text/plain' });
                        a.download = makeFileName();
                        document.body.appendChild(a);
                        // IE: "Access is denied". 
                        // ref: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
                        a.click();
                        document.body.removeChild(a);
                    }

                    $analytics.eventTrack('Exported Organization Data');
                    toastr.success('Your data has been exported. Check your browser\'s downloads folder.', 'Success!');
                    $scope.close();
                }
                catch (err) {
                    toastr.error('Something went wrong. Please try again.', 'Error!');
                    $scope.close();
                }
            }, function () {
                toastr.error('Something went wrong. Please try again.', 'Error!');
                $scope.close();
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        function makeFileName() {
            var now = new Date();
            var dateString =
                now.getFullYear() + '' + padNumber(now.getMonth() + 1, 2) + '' + padNumber(now.getDate(), 2) +
                padNumber(now.getHours(), 2) + '' + padNumber(now.getMinutes(), 2) +
                padNumber(now.getSeconds(), 2);

            return 'bitwarden_org_export_' + dateString + '.csv';
        }

        function padNumber(number, width, paddingCharacter) {
            paddingCharacter = paddingCharacter || '0';
            number = number + '';
            return number.length >= width ? number : new Array(width - number.length + 1).join(paddingCharacter) + number;
        }
    });
