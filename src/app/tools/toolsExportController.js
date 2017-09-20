angular
    .module('bit.tools')

    .controller('toolsExportController', function ($scope, apiService, $uibModalInstance, cipherService, $q,
        toastr, $analytics) {
        $analytics.eventTrack('toolsExportController', { category: 'Modal' });
        $scope.export = function (model) {
            $scope.startedExport = true;
            var decLogins = [],
                decFolders = [];

            var folderPromise = apiService.folders.list({}, function (folders) {
                decFolders = cipherService.decryptFolders(folders.Data);
            }).$promise;

            var loginsPromise = apiService.ciphers.list({}, function (logins) {
                decLogins = cipherService.decryptLogins(logins.Data);
            }).$promise;

            $q.all([folderPromise, loginsPromise]).then(function () {
                if (!decLogins.length) {
                    toastr.error('Nothing to export.', 'Error!');
                    $scope.close();
                    return;
                }

                var foldersDict = {};
                for (var i = 0; i < decFolders.length; i++) {
                    foldersDict[decFolders[i].id] = decFolders[i];
                }

                try {
                    var exportLogins = [];
                    for (i = 0; i < decLogins.length; i++) {
                        var login = {
                            name: decLogins[i].name,
                            uri: decLogins[i].uri,
                            username: decLogins[i].username,
                            password: decLogins[i].password,
                            notes: decLogins[i].notes,
                            folder: decLogins[i].folderId && (decLogins[i].folderId in foldersDict) ?
                                foldersDict[decLogins[i].folderId].name : null,
                            favorite: decLogins[i].favorite ? 1 : null,
                            totp: decLogins[i].totp
                        };

                        exportLogins.push(login);
                    }

                    var csvString = Papa.unparse(exportLogins);
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

                    $analytics.eventTrack('Exported Data');
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

            return 'bitwarden_export_' + dateString + '.csv';
        }

        function padNumber(number, width, paddingCharacter) {
            paddingCharacter = paddingCharacter || '0';
            number = number + '';
            return number.length >= width ? number : new Array(width - number.length + 1).join(paddingCharacter) + number;
        }
    });
