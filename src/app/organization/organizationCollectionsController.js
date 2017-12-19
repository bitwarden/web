angular
    .module('bit.organization')

    .controller('organizationCollectionsController', function ($scope, $state, apiService, $uibModal, cipherService, $filter,
        toastr, $analytics, $uibModalStack) {
        $scope.collections = [];
        $scope.loading = true;
        $scope.$on('$viewContentLoaded', function () {
            loadList();
        });

        $scope.$on('organizationCollectionsAdd', function (event, args) {
            $scope.add();
        });

        $scope.add = function () {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationCollectionsAdd.html',
                controller: 'organizationCollectionsAddController'
            });

            modal.result.then(function (collection) {
                $scope.collections.push(collection);
            });
        };

        $scope.edit = function (collection) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationCollectionsEdit.html',
                controller: 'organizationCollectionsEditController',
                resolve: {
                    id: function () { return collection.id; }
                }
            });

            modal.result.then(function (editedCollection) {
                var existingCollections = $filter('filter')($scope.collections, { id: editedCollection.id }, true);
                if (existingCollections && existingCollections.length > 0) {
                    existingCollections[0].name = editedCollection.name;
                }
            });
        };

        $scope.users = function (collection) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationCollectionsUsers.html',
                controller: 'organizationCollectionsUsersController',
                size: 'lg',
                resolve: {
                    collection: function () { return collection; }
                }
            });

            modal.result.then(function () {
                // nothing to do
            });
        };

        $scope.groups = function (collection) {
            var modal = $uibModal.open({
                animation: true,
                templateUrl: 'app/organization/views/organizationCollectionsGroups.html',
                controller: 'organizationCollectionsGroupsController',
                resolve: {
                    collection: function () { return collection; }
                }
            });

            modal.result.then(function () {
                // nothing to do
            });
        };

        $scope.delete = function (collection) {
            if (!confirm('Are you sure you want to delete this collection (' + collection.name + ')?')) {
                return;
            }

            apiService.collections.del({ orgId: $state.params.orgId, id: collection.id }, function () {
                var index = $scope.collections.indexOf(collection);
                if (index > -1) {
                    $scope.collections.splice(index, 1);
                }

                $analytics.eventTrack('Deleted Collection');
                toastr.success(collection.name + ' has been deleted.', 'Collection Deleted');
            }, function () {
                toastr.error(collection.name + ' was not able to be deleted.', 'Error');
            });
        };

        function loadList() {
            apiService.collections.listOrganization({ orgId: $state.params.orgId }, function (list) {
                $scope.collections = cipherService.decryptCollections(list.Data, $state.params.orgId, true);
                $scope.loading = false;

                if ($state.params.search) {
                    $uibModalStack.dismissAll();
                    $scope.filterSearch = $state.params.search;
                    $('#filterSearch').focus();
                }
            });
        }
    });
