angular
    .module('bit.tools')

    .controller('toolsExportController', function ($scope, apiService, authService, $uibModalInstance, cryptoService, cipherService, $q, toastr, $analytics) {
        $analytics.eventTrack('toolsExportController', { category: 'Modal' });
        $scope.export = function (model) {
            $scope.startedExport = true;
            apiService.sites.list({ expand: ['folder'] }, function (sites) {
                try {
                    var decSites = cipherService.decryptSites(sites.Data);

                    var exportSites = [];
                    for (var i = 0; i < decSites.length; i++) {
                        var site = {
                            name: decSites[i].name,
                            uri: decSites[i].uri,
                            username: decSites[i].username,
                            password: decSites[i].password,
                            notes: decSites[i].notes,
                            folder: decSites[i].folder ? decSites[i].folder.name : null
                        };

                        exportSites.push(site);
                    }

                    var csvString = Papa.unparse(exportSites);
                    var csvBlob = new Blob([csvString]);
                    if (window.navigator.msSaveOrOpenBlob) { // IE hack. ref http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                        window.navigator.msSaveBlob(csvBlob, makeFileName());
                    }
                    else {
                        var a = window.document.createElement('a');
                        a.href = window.URL.createObjectURL(csvBlob, { type: 'text/plain' });
                        a.download = makeFileName();
                        document.body.appendChild(a);
                        a.click(); // IE: "Access is denied". ref: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
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
