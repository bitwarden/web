angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService, $q) {
        var _service = {};

        _service.decryptLogins = function (encryptedLogins) {
            if (!encryptedLogins) throw "encryptedLogins is undefined or null";

            var unencryptedLogins = [];
            for (var i = 0; i < encryptedLogins.length; i++) {
                unencryptedLogins.push(_service.decryptLogin(encryptedLogins[i]));
            }

            return unencryptedLogins;
        };

        _service.decryptLogin = function (encryptedLogin) {
            if (!encryptedLogin) throw "encryptedLogin is undefined or null";

            var key = null;
            if (encryptedLogin.OrganizationId) {
                key = cryptoService.getOrgKey(encryptedLogin.OrganizationId);
            }

            var login = {
                id: encryptedLogin.Id,
                organizationId: encryptedLogin.OrganizationId,
                collectionIds: encryptedLogin.CollectionIds || [],
                'type': 1,
                folderId: encryptedLogin.FolderId,
                favorite: encryptedLogin.Favorite,
                edit: encryptedLogin.Edit,
                name: cryptoService.decrypt(encryptedLogin.Name, key),
                uri: encryptedLogin.Uri && encryptedLogin.Uri !== '' ? cryptoService.decrypt(encryptedLogin.Uri, key) : null,
                username: encryptedLogin.Username && encryptedLogin.Username !== '' ? cryptoService.decrypt(encryptedLogin.Username, key) : null,
                password: encryptedLogin.Password && encryptedLogin.Password !== '' ? cryptoService.decrypt(encryptedLogin.Password, key) : null,
                notes: encryptedLogin.Notes && encryptedLogin.Notes !== '' ? cryptoService.decrypt(encryptedLogin.Notes, key) : null,
                attachments: null
            };

            if (!encryptedLogin.Attachments) {
                return login;
            }

            login.attachments = [];
            for (var i = 0; i < encryptedLogin.Attachments.length; i++) {
                login.attachments.push(_service.decryptAttachment(key, encryptedLogin.Attachments[i]));
            }

            return login;
        };

        _service.decryptLoginPreview = function (encryptedCipher) {
            if (!encryptedCipher) throw "encryptedCipher is undefined or null";

            var key = null;
            if (encryptedCipher.OrganizationId) {
                key = cryptoService.getOrgKey(encryptedCipher.OrganizationId);
            }

            var login = {
                id: encryptedCipher.Id,
                organizationId: encryptedCipher.OrganizationId,
                collectionIds: encryptedCipher.CollectionIds || [],
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                edit: encryptedCipher.Edit,
                name: _service.decryptProperty(encryptedCipher.Data.Name, key, false),
                username: _service.decryptProperty(encryptedCipher.Data.Username, key, true),
                password: _service.decryptProperty(encryptedCipher.Data.Password, key, true),
                hasAttachments: !!encryptedCipher.Attachments
            };

            return login;
        };

        _service.decryptAttachment = function (key, encryptedAttachment) {
            if (!encryptedAttachment) throw "encryptedAttachment is undefined or null";

            return {
                id: encryptedAttachment.Id,
                fileName: cryptoService.decrypt(encryptedAttachment.FileName, key),
                size: encryptedAttachment.SizeName
            };
        };

        _service.decryptFolders = function (encryptedFolders) {
            if (!encryptedFolders) throw "encryptedFolders is undefined or null";

            var unencryptedFolders = [];
            for (var i = 0; i < encryptedFolders.length; i++) {
                unencryptedFolders.push(_service.decryptFolder(encryptedFolders[i]));
            }

            return unencryptedFolders;
        };

        _service.decryptFolder = function (encryptedFolder) {
            if (!encryptedFolder) throw "encryptedFolder is undefined or null";

            return {
                id: encryptedFolder.Id,
                name: cryptoService.decrypt(encryptedFolder.Name)
            };
        };

        _service.decryptFolderPreview = function (encryptedFolder) {
            if (!encryptedFolder) throw "encryptedFolder is undefined or null";

            return {
                id: encryptedFolder.Id,
                name: _service.decryptProperty(encryptedFolder.Name, null, false)
            };
        };

        _service.decryptCollections = function (encryptedCollections, orgId, catchError) {
            if (!encryptedCollections) throw "encryptedCollections is undefined or null";

            var unencryptedCollections = [];
            for (var i = 0; i < encryptedCollections.length; i++) {
                unencryptedCollections.push(_service.decryptCollection(encryptedCollections[i], orgId, catchError));
            }

            return unencryptedCollections;
        };

        _service.decryptCollection = function (encryptedCollection, orgId, catchError) {
            if (!encryptedCollection) throw "encryptedCollection is undefined or null";

            catchError = catchError === true ? true : false;
            orgId = orgId || encryptedCollection.OrganizationId;
            var key = cryptoService.getOrgKey(orgId);

            return {
                id: encryptedCollection.Id,
                name: catchError ? _service.decryptProperty(encryptedCollection.Name, key, false) :
                    cryptoService.decrypt(encryptedCollection.Name, key)
            };
        };

        _service.decryptProperty = function (property, key, checkEmpty) {
            if (checkEmpty && (!property || property === '')) {
                return null;
            }

            try {
                property = cryptoService.decrypt(property, key);
            }
            catch (err) {
                property = null;
            }

            return property || '[error: cannot decrypt]';
        };

        _service.encryptLogins = function (unencryptedLogins, key) {
            if (!unencryptedLogins) throw "unencryptedLogins is undefined or null";

            var encryptedLogins = [];
            for (var i = 0; i < unencryptedLogins.length; i++) {
                encryptedLogins.push(_service.encryptLogin(unencryptedLogins[i], key));
            }

            return encryptedLogins;
        };

        _service.encryptLogin = function (unencryptedLogin, key) {
            if (!unencryptedLogin) throw "unencryptedLogin is undefined or null";

            if (unencryptedLogin.organizationId) {
                key = key || cryptoService.getOrgKey(unencryptedLogin.organizationId);
            }

            return {
                id: unencryptedLogin.id,
                'type': 1,
                organizationId: unencryptedLogin.organizationId || null,
                folderId: unencryptedLogin.folderId === '' ? null : unencryptedLogin.folderId,
                favorite: unencryptedLogin.favorite !== null ? unencryptedLogin.favorite : false,
                uri: !unencryptedLogin.uri || unencryptedLogin.uri === '' ? null : cryptoService.encrypt(unencryptedLogin.uri, key),
                name: cryptoService.encrypt(unencryptedLogin.name, key),
                username: !unencryptedLogin.username || unencryptedLogin.username === '' ? null : cryptoService.encrypt(unencryptedLogin.username, key),
                password: !unencryptedLogin.password || unencryptedLogin.password === '' ? null : cryptoService.encrypt(unencryptedLogin.password, key),
                notes: !unencryptedLogin.notes || unencryptedLogin.notes === '' ? null : cryptoService.encrypt(unencryptedLogin.notes, key)
            };
        };

        _service.encryptFolders = function (unencryptedFolders, key) {
            if (!unencryptedFolders) throw "unencryptedFolders is undefined or null";

            var encryptedFolders = [];
            for (var i = 0; i < unencryptedFolders.length; i++) {
                encryptedFolders.push(_service.encryptFolder(unencryptedFolders[i], key));
            }

            return encryptedFolders;
        };

        _service.encryptFolder = function (unencryptedFolder, key) {
            if (!unencryptedFolder) throw "unencryptedFolder is undefined or null";

            return {
                id: unencryptedFolder.id,
                name: cryptoService.encrypt(unencryptedFolder.name, key)
            };
        };

        _service.encryptCollections = function (unencryptedCollections, orgId) {
            if (!unencryptedCollections) throw "unencryptedCollections is undefined or null";

            var encryptedCollections = [];
            for (var i = 0; i < unencryptedCollections.length; i++) {
                encryptedCollections.push(_service.encryptCollection(unencryptedCollections[i], orgId));
            }

            return encryptedCollections;
        };

        _service.encryptCollection = function (unencryptedCollection, orgId) {
            if (!unencryptedCollection) throw "unencryptedCollection is undefined or null";

            return {
                id: unencryptedCollection.id,
                name: cryptoService.encrypt(unencryptedCollection.name, cryptoService.getOrgKey(orgId))
            };
        };

        _service.updateKey = function (masterPasswordHash, success, error) {
            var madeEncKey = cryptoService.makeEncKey(null);
            encKey = madeEncKey.encKey;
            var encKeyEnc = madeEncKey.encKeyEnc;

            var reencryptedLogins = [];
            var loginsPromise = apiService.logins.list({}, function (encryptedLogins) {
                var filteredEncryptedLogins = [];
                for (var i = 0; i < encryptedLogins.Data.length; i++) {
                    if (encryptedLogins.Data[i].OrganizationId) {
                        continue;
                    }

                    filteredEncryptedLogins.push(encryptedLogins.Data[i]);
                }

                var unencryptedLogins = _service.decryptLogins(filteredEncryptedLogins);
                reencryptedLogins = _service.encryptLogins(unencryptedLogins, encKey);
            }).$promise;

            var reencryptedFolders = [];
            var foldersPromise = apiService.folders.list({}, function (encryptedFolders) {
                var unencryptedFolders = _service.decryptFolders(encryptedFolders.Data);
                reencryptedFolders = _service.encryptFolders(unencryptedFolders, encKey);
            }).$promise;

            var privateKey = cryptoService.getPrivateKey('raw'),
                reencryptedPrivateKey = null;
            if (privateKey) {
                reencryptedPrivateKey = cryptoService.encrypt(privateKey, encKey, 'raw');
            }

            return $q.all([loginsPromise, foldersPromise]).then(function () {
                var request = {
                    masterPasswordHash: masterPasswordHash,
                    ciphers: reencryptedLogins,
                    folders: reencryptedFolders,
                    privateKey: reencryptedPrivateKey,
                    key: encKeyEnc
                };

                return apiService.accounts.putKey(request).$promise;
            }, error).then(function () {
                cryptoService.setEncKey(encKey, null, true);
                return success();
            }, function () {
                cryptoService.clearEncKey();
                error();
            });
        };

        return _service;
    });
