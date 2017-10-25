angular
    .module('bit.vault')

    .controller('vaultAddCipherController', function ($scope, apiService, $uibModalInstance, cryptoService, cipherService,
        passwordService, selectedFolder, $analytics, checkedFavorite, $rootScope, authService, $uibModal, constants) {
        $analytics.eventTrack('vaultAddCipherController', { category: 'Modal' });
        $scope.folders = $rootScope.vaultFolders;
        $scope.constants = constants;
        $scope.selectedType = constants.cipherType.login.toString();
        $scope.cipher = {
            folderId: selectedFolder ? selectedFolder.id : null,
            favorite: checkedFavorite === true,
            type: constants.cipherType.login,
            login: {},
            identity: {},
            card: {},
            secureNote: {
                type: '0'
            }
        };

        authService.getUserProfile().then(function (profile) {
            $scope.useTotp = profile.premium;
        });

        $scope.typeChanged = function () {
            $scope.cipher.type = parseInt($scope.selectedType);
        };

        $scope.savePromise = null;
        $scope.save = function () {
            var cipher = cipherService.encryptCipher($scope.cipher);
            $scope.savePromise = apiService.ciphers.post(cipher, function (cipherResponse) {
                $analytics.eventTrack('Created Cipher');
                var decCipher = cipherService.decryptCipherPreview(cipherResponse);
                $uibModalInstance.close(decCipher);
            }).$promise;
        };

        $scope.generatePassword = function () {
            if (!$scope.cipher.login.password || confirm('Are you sure you want to overwrite the current password?')) {
                $analytics.eventTrack('Generated Password From Add');
                $scope.cipher.login.password = passwordService.generatePassword({ length: 12, special: true });
            }
        };

        $scope.addField = function () {
            if (!$scope.cipher.fields) {
                $scope.cipher.fields = [];
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

        $scope.toggleFavorite = function () {
            $scope.cipher.favorite = !$scope.cipher.favorite;
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

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        function selectPassword(e) {
            var target = $(e.trigger).parent().prev();
            if (target.attr('type') === 'text') {
                target.select();
            }
        }

        $scope.close = function () {
            $uibModalInstance.dismiss('close');
        };

        $scope.showUpgrade = function () {
            $uibModal.open({
                animation: true,
                templateUrl: 'app/views/premiumRequired.html',
                controller: 'premiumRequiredController'
            });
        };
    });
