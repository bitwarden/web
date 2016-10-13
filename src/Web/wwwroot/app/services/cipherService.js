angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService) {
        var _service = {};

        _service.decryptSites = function (encryptedSites) {
            if (!encryptedSites) throw "encryptedSites is undefined or null";

            var unencryptedSites = [];
            for (var i = 0; i < encryptedSites.length; i++) {
                unencryptedSites.push(_service.decryptSite(encryptedSites[i]));
            }

            return unencryptedSites;
        };

        _service.decryptSite = function (encryptedSite) {
            if (!encryptedSite) throw "encryptedSite is undefined or null";

            var site = {
                id: encryptedSite.Id,
                'type': 1,
                folderId: encryptedSite.FolderId,
                favorite: encryptedSite.Favorite,
                name: cryptoService.decrypt(encryptedSite.Name),
                uri: encryptedSite.Uri && encryptedSite.Uri !== '' ? cryptoService.decrypt(encryptedSite.Uri) : null,
                username: encryptedSite.Username && encryptedSite.Username !== '' ? cryptoService.decrypt(encryptedSite.Username) : null,
                password: encryptedSite.Password && encryptedSite.Password !== '' ? cryptoService.decrypt(encryptedSite.Password) : null,
                notes: encryptedSite.Notes && encryptedSite.Notes !== '' ? cryptoService.decrypt(encryptedSite.Notes) : null
            };

            if (encryptedSite.Folder) {
                site.folder = {
                    name: cryptoService.decrypt(encryptedSite.Folder.Name)
                };
            }

            return site;
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

        _service.encryptSites = function (unencryptedSites, key) {
            if (!unencryptedSites) throw "unencryptedSites is undefined or null";

            var encryptedSites = [];
            for (var i = 0; i < unencryptedSites.length; i++) {
                encryptedSites.push(_service.encryptSite(unencryptedSites[i], key));
            }

            return encryptedSites;
        };

        _service.encryptSite = function (unencryptedSite, key) {
            if (!unencryptedSite) throw "unencryptedSite is undefined or null";

            return {
                id: unencryptedSite.id,
                'type': 1,
                folderId: unencryptedSite.folderId === '' ? null : unencryptedSite.folderId,
                favorite: unencryptedSite.favorite !== null ? unencryptedSite.favorite : false,
                uri: !unencryptedSite.uri || unencryptedSite.uri === '' ? null : cryptoService.encrypt(unencryptedSite.uri, key),
                name: cryptoService.encrypt(unencryptedSite.name, key),
                username: !unencryptedSite.username || unencryptedSite.username === '' ? null : cryptoService.encrypt(unencryptedSite.username, key),
                password: !unencryptedSite.password || unencryptedSite.password === '' ? null : cryptoService.encrypt(unencryptedSite.password, key),
                notes: !unencryptedSite.notes || unencryptedSite.notes === '' ? null : cryptoService.encrypt(unencryptedSite.notes, key)
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
