angular
    .module('bit.organization')

    .controller('organizationVaultEditLoginController', function ($scope, apiService, $uibModalInstance, cryptoService,
        cipherService, passwordService, loginId, $analytics, orgId, $uibModal) {
        $analytics.eventTrack('organizationVaultEditLoginController', { category: 'Modal' });
        $scope.login = {};
        $scope.hideFolders = $scope.hideFavorite = $scope.fromOrg = true;

        apiService.ciphers.getAdmin({ id: loginId }, function (login) {
            $scope.login = cipherService.decryptLogin(login);
            $scope.useTotp = $scope.login.organizationUseTotp;
        });

        $scope.save = function (model) {
            var login = cipherService.encryptLogin(model);
            $scope.savePromise = apiService.ciphers.putAdmin({ id: loginId }, login, function (loginResponse) {
                $analytics.eventTrack('Edited Organization Login');
                var decLogin = cipherService.decryptLogin(loginResponse);
                $uibModalInstance.close({
                    action: 'edit',
                    data: decLogin
                });
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Edit');
                $scope.login.password = passwordService.generatePassword({ length: 12, special: true });
            }
        };

        $scope.addField = function () {
            if (!$scope.login.fields) {
                $scope.login.fields = [];
            }

            $scope.login.fields.push({
                type: '0',
                name: null,
                value: null
            });
        };

        $scope.removeField = function (field) {
            var index = $scope.login.fields.indexOf(field);
            if (index > -1) {
                $scope.login.fields.splice(index, 1);
            }
        };

        $scope.clipboardSuccess = function (e) {
            e.clearSelection();
            selectPassword(e);
        };

        $scope.clipboardError = function (e, password) {
            if (password) {
                selectPassword(e);
            }
            alert('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.delete = function () {
            if (!confirm('Are you sure you want to delete this login (' + $scope.login.name + ')?')) {
                return;
            }

            apiService.ciphers.delAdmin({ id: $scope.login.id }, function () {
                $analytics.eventTrack('Deleted Organization Login From Edit');
                $uibModalInstance.close({
                    action: 'delete',
                    data: $scope.login.id
                });
            });
        };

        $scope.close = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.showUpgrade = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/paidOrgRequired.html',
                controller: 'paidOrgRequiredController',
                resolve: {
                    orgId: function () { return orgId; }
                }
            });
        };
    });
