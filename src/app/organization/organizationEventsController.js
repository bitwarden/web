angular
    .module('bit.organization')

    .controller('organizationEventsController', function ($scope, $state, apiService, $uibModal, $filter,
        toastr, $analytics, constants, eventService, $compile, $sce) {
        $scope.events = [];
        $scope.orgUsers = [];
        $scope.loading = true;
        $scope.continuationToken = null;

        var defaultFilters = eventService.getDefaultDateFilters();
        $scope.filterStart = defaultFilters.start;
        $scope.filterEnd = defaultFilters.end;

        $scope.$on('$viewContentLoaded', function () {
            load();
        });

        $scope.refresh = function () {
            loadEvents(true);
        };

        $scope.next = function () {
            loadEvents(false);
        };

        var i = 0,
            orgUsersUserIdDict = {},
            orgUsersIdDict = {};

        function load() {
            apiService.organizationUsers.list({ orgId: $state.params.orgId }).$promise.then(function (list) {
                var users = [];
                for (i = 0; i < list.Data.length; i++) {
                    var user = {
                        id: list.Data[i].Id,
                        userId: list.Data[i].UserId,
                        name: list.Data[i].Name,
                        email: list.Data[i].Email
                    };

                    users.push(user);

                    var displayName = user.name || user.email;
                    orgUsersUserIdDict[user.userId] = displayName;
                    orgUsersIdDict[user.id] = displayName;
                }

                $scope.orgUsers = users;

                return loadEvents(true);
            });
        }

        function loadEvents(clearExisting) {
            var filterResult = eventService.formatDateFilters($scope.filterStart, $scope.filterEnd);
            if (filterResult.error) {
                alert(filterResult.error);
                return;
            }

            if (clearExisting) {
                $scope.continuationToken = null;
                $scope.events = [];
            }

            $scope.loading = true;
            return apiService.events.listOrganization({
                orgId: $state.params.orgId,
                start: filterResult.start,
                end: filterResult.end,
                continuationToken: $scope.continuationToken
            }).$promise.then(function (list) {
                $scope.continuationToken = list.ContinuationToken;

                var events = [];
                for (i = 0; i < list.Data.length; i++) {
                    var userId = list.Data[i].ActingUserId || list.Data[i].UserId;
                    var eventInfo = eventService.getEventInfo(list.Data[i]);
                    var htmlMessage = $compile('<span>' + eventInfo.message + '</span>')($scope);
                    events.push({
                        message: $sce.trustAsHtml(htmlMessage[0].outerHTML),
                        appIcon: eventInfo.appIcon,
                        appName: eventInfo.appName,
                        userId: userId,
                        userName: userId ? (orgUsersUserIdDict[userId] || '-') : '-',
                        date: list.Data[i].Date,
                        ip: list.Data[i].IpAddress
                    });
                }
                if ($scope.events && $scope.events.length > 0) {
                    $scope.events = $scope.events.concat(events);
                }
                else {
                    $scope.events = events;
                }
                $scope.loading = false;
            });
        }
    });
