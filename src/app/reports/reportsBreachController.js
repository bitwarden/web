angular
    .module('bit.tools')

    .controller('reportsBreachController', function ($scope, apiService, toastr, authService) {
        $scope.loading = true;
        $scope.error = false;
        $scope.breachAccounts = [];
        $scope.email = null;

        $scope.$on('$viewContentLoaded', function () {
            authService.getUserProfile().then(function (userProfile) {
                $scope.email = userProfile.email;
                return apiService.hibp.get({ email: $scope.email }).$promise;
            }).then(function (response) {
                var breachAccounts = [];
                for (var i = 0; i < response.length; i++) {
                    var breach = {
                        id: response[i].Name,
                        title: response[i].Title,
                        domain: response[i].Domain,
                        date: new Date(response[i].BreachDate),
                        reportedDate: new Date(response[i].AddedDate),
                        modifiedDate: new Date(response[i].ModifiedDate),
                        count: response[i].PwnCount,
                        description: response[i].Description,
                        classes: response[i].DataClasses,
                        image: 'https://haveibeenpwned.com/Content/Images/PwnedLogos/' + response[i].Name + '.' + response[i].LogoType
                    };
                    breachAccounts.push(breach);
                }
                $scope.breachAccounts = breachAccounts;
                $scope.loading = false;
            }, function (response) {
                $scope.error = response.status !== 404;
                $scope.loading = false;
            });
        });
    });
