angular
    .module('bit.vault')

    .controller('vaultMoveCiphersController', function ($scope, apiService, $uibModalInstance, ids, $analytics,
        $rootScope, $filter) {
        $analytics.eventTrack('vaultMoveCiphersController', { category: 'Modal' });
        $scope.folders = $filter('filter')($rootScope.vaultGroupings, { folder: true });
        $scope.count = ids.length;

        $scope.save = function () {
            $scope.savePromise = apiService.ciphers.moveMany({ ids: ids, folderId: $scope.folderId }, function () {
                $analytics.eventTrack('Bulk Moved Ciphers');
                $uibModalInstance.close($scope.folderId || null);
            }).$promise;
        };

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '!';
            }

            return item.name.toLowerCase();
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
