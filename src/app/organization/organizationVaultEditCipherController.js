angular
    .module('bit.organization')

    .controller('organizationVaultEditCipherController', function ($scope, apiService, $uibModalInstance, cryptoService,
        cipherService, passwordService, cipherId, $analytics, orgId, $uibModal, constants) {
        $analytics.eventTrack('organizationVaultEditCipherController', { category: 'Modal' });
        $scope.cipher = {};
        $scope.hideFolders = $scope.hideFavorite = $scope.fromOrg = true;
        $scope.constants = constants;

        apiService.ciphers.getAdmin({ id: cipherId }, function (cipher) {
            $scope.cipher = cipherService.decryptCipher(cipher);
            $scope.useTotp = $scope.cipher.organizationUseTotp;
            setUriMatchValues();
        });

        $scope.save = function (model) {
            var cipher = cipherService.encryptCipher(model, $scope.cipher.type);
            $scope.savePromise = apiService.ciphers.putAdmin({ id: cipherId }, cipher, function (cipherResponse) {
                $analytics.eventTrack('Edited Organization Cipher');
                var decCipher = cipherService.decryptCipherPreview(cipherResponse);
                $uibModalInstance.close({
                    action: 'edit',
                    data: decCipher
                });
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.cipher.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Edit');
                $scope.cipher.login.password = passwordService.generatePassword({ length: 14, special: true });
            }
        };

        $scope.addUri = function () {
            if (!$scope.cipher.login) {
                return;
            }

            if (!$scope.cipher.login.uris) {
                $scope.cipher.login.uris = [];
            }

            $scope.cipher.login.uris.push({
                uri: null,
                match: null,
                matchValue: null
            });
        };

        $scope.removeUri = function (uri) {
            if (!$scope.cipher.login || !$scope.cipher.login.uris) {
                return;
            }

            var index = $scope.cipher.login.uris.indexOf(uri);
            if (index > -1) {
                $scope.cipher.login.uris.splice(index, 1);
            }
        };

        $scope.uriMatchChanged = function (uri) {
            if ((!uri.matchValue && uri.matchValue !== 0) || uri.matchValue === '') {
                uri.match = null;
            }
            else {
                uri.match = parseInt(uri.matchValue);
            }
        };

        $scope.addField = function () {
            if (!$scope.cipher.login.fields) {
                $scope.cipher.login.fields = [];
            }

            $scope.cipher.fields.push({
                type: constants.fieldType.text.toString(),
                name: null,
                value: null
            });
        };

        $scope.removeField = function (field) {
            var index = $scope.cipher.fields.indexOf(field);
            if (index > -1) {
                $scope.cipher.fields.splice(index, 1);
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
            if (!confirm('Are you sure you want to delete this item (' + $scope.cipher.name + ')?')) {
                return;
            }

            apiService.ciphers.delAdmin({ id: $scope.cipher.id }, function () {
                $analytics.eventTrack('Deleted Organization Cipher From Edit');
                $uibModalInstance.close({
                    action: 'delete',
                    data: $scope.cipher.id
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

        function setUriMatchValues() {
            if ($scope.cipher.login && $scope.cipher.login.uris) {
                for (var i = 0; i < $scope.cipher.login.uris.length; i++) {
                    $scope.cipher.login.uris[i].matchValue =
                        $scope.cipher.login.uris[i].match || $scope.cipher.login.uris[i].match === 0 ?
                            $scope.cipher.login.uris[i].match.toString() : '';
                }
            }
        }
    });
