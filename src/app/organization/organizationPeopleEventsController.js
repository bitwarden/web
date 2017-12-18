angular
    .module('bit.organization')

    .controller('organizationPeopleEventsController', function ($scope, apiService, $uibModalInstance,
        orgUser, $analytics, eventService, orgId) {
        $analytics.eventTrack('organizationPeopleEventsController', { category: 'Modal' });
        $scope.email = orgUser.email;
        $scope.events = [];
        $scope.loading = true;
        $scope.continuationToken = null;

        var defaultFilters = eventService.getDefaultDateFilters();
        $scope.filterStart = defaultFilters.start;
        $scope.filterEnd = defaultFilters.end;

        $uibModalInstance.opened.then(function () {
            loadEvents(true);
        });

        $scope.refresh = function () {
            loadEvents(true);
        };

        $scope.next = function () {
            loadEvents(false);
        };
        
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
            return apiService.events.listOrganizationUser({
                orgId: orgId,
                id: orgUser.id,
                start: filterResult.start,
                end: filterResult.end,
                continuationToken: $scope.continuationToken
            }).$promise.then(function (list) {
                $scope.continuationToken = list.ContinuationToken;

                var events = [];
                for (var i = 0; i < list.Data.length; i++) {
                    var eventInfo = eventService.getEventInfo(list.Data[i]);
                    events.push({
                        message: eventInfo.message,
                        appIcon: eventInfo.appIcon,
                        appName: eventInfo.appName,
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

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });
