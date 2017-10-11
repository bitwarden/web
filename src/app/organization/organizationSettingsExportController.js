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
                    for (var i = 0; i < ciphers.Data.length; i++) {
                        if (ciphers.Data[i].Type === 1) {
                            var decCipher = cipherService.decryptCipher(ciphers.Data[i]);
                            decCiphers.push(decCipher);
                        }
                    }
                }).$promise;

            $q.all([collectionsPromise, ciphersPromise]).then(function () {
                if (!decCiphers.length) {
                    toastr.error('Nothing to export.', 'Error!');
                    $scope.close();
                    return;
                }

                var collectionsDict = {};
                for (var i = 0; i < decCollections.length; i++) {
                    collectionsDict[decCollections[i].id] = decCollections[i];
                }

                try {
                    var exportCiphers = [];
                    for (i = 0; i < decCiphers.length; i++) {
                        // only export logins for now
                        if (decCiphers[i].type !== constants.cipherType.login) {
                            continue;
                        }

                        var login = {
                            name: decCiphers[i].name,
                            uri: decCiphers[i].login.uri,
                            username: decCiphers[i].login.username,
                            password: decCiphers[i].login.password,
                            notes: decCiphers[i].notes,
                            totp: decCiphers[i].login.totp,
                            collections: [],
                            fields: null
                        };

                        var j;
                        if (decCiphers[i].fields) {
                            for (j = 0; j < decCiphers[i].fields.length; j++) {
                                if (!login.fields) {
                                    login.fields = '';
                                }
                                else {
                                    login.fields += '\n';
                                }
                                
                                login.fields += ((decCiphers[i].fields[j].name || '') + ': ' + decCiphers[i].fields[j].value);
                            }
                        }

                        if (decCiphers[i].collectionIds) {
                            for (j = 0; j < decCiphers[i].collectionIds.length; j++) {
                                if (collectionsDict.hasOwnProperty(decCiphers[i].collectionIds[j])) {
                                    login.collections.push(collectionsDict[decCiphers[i].collectionIds[j]].name);
                                }
                            }
                        }

                        exportCiphers.push(login);
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
