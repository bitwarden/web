angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService) {
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
            if (encryptedLogin.Key) {
                key = cryptoService.rsaDecrypt(encryptedLogin.Key);
            }

            var login = {
                id: encryptedLogin.Id,
                'type': 1,
                folderId: encryptedLogin.FolderId,
                favorite: encryptedLogin.Favorite,
                name: cryptoService.decrypt(encryptedLogin.Name, key),
                uri: encryptedLogin.Uri && encryptedLogin.Uri !== '' ? cryptoService.decrypt(encryptedLogin.Uri, key) : null,
                username: encryptedLogin.Username && encryptedLogin.Username !== '' ? cryptoService.decrypt(encryptedLogin.Username, key) : null,
                password: encryptedLogin.Password && encryptedLogin.Password !== '' ? cryptoService.decrypt(encryptedLogin.Password, key) : null,
                notes: encryptedLogin.Notes && encryptedLogin.Notes !== '' ? cryptoService.decrypt(encryptedLogin.Notes, key) : null,
                key: encryptedLogin.Key
            };

            if (encryptedLogin.Folder) {
                login.folder = {
                    name: cryptoService.decrypt(encryptedLogin.Folder.Name)
                };
            }

            return login;
        };

        _service.decryptLoginPreview = function (encryptedCipher) {
            if (!encryptedCipher) throw "encryptedCipher is undefined or null";

            var key = null;
            if (encryptedCipher.Key) {
                key = cryptoService.rsaDecrypt(encryptedCipher.Key);
            }

            var login = {
                id: encryptedCipher.Id,
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                name: decryptProperty(encryptedCipher.Data.Name, key, false),
                username: decryptProperty(encryptedCipher.Data.Username, key, true)
            };

            try {
                login.name = cryptoService.decrypt(encryptedCipher.Data.Name, key);
            }
            catch (err) {
                login.name = '[error: cannot decrypt]';
            }

            try {
                login.username = encryptedCipher.Data.Username && encryptedCipher.Data.Username !== '' ?
                        cryptoService.decrypt(encryptedCipher.Data.Username, key) : null;
            }
            catch (err) {
                login.username = '[error: cannot decrypt]';
            }

            return login;
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
                'type': 0,
                name: cryptoService.decrypt(encryptedFolder.Name)
            };
        };

        _service.decryptFolderPreview = function (encryptedFolder) {
            if (!encryptedFolder) throw "encryptedFolder is undefined or null";

            return {
                id: encryptedFolder.Id,
                name: decryptProperty(encryptedFolder.Data.Name, null, false)
            };
        };

        function decryptProperty(property, key, checkEmpty) {
            if (checkEmpty && (!property || property === '')) {
                return null;
            }

            try {
                property = cryptoService.decrypt(property, key);
            }
            catch (err) {
                property = '[error: cannot decrypt]';
            }

            return property;
        }

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

            return {
                id: unencryptedLogin.id,
                'type': 1,
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
                'type': 0,
                name: cryptoService.encrypt(unencryptedFolder.name, key)
            };
        };

        return _service;
    });
