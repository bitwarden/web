angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService, $q, $window) {
        var _service = {};

        _service.decryptLogins = function (encryptedLogins) {
            if (!encryptedLogins) throw "encryptedLogins is undefined or null";

            var unencryptedLogins = [];
            for (var i = 0; i < encryptedLogins.length; i++) {
                unencryptedLogins.push(_service.decryptLogin(encryptedLogins[i]));
            }

            return unencryptedLogins;
        };

        _service.decryptLogin = function (encryptedLogin, isCipher) {
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
                organizationUseTotp: encryptedLogin.OrganizationUseTotp,
                attachments: null
            };

            var loginData = encryptedLogin.Data || encryptedLogin;
            if (loginData) {
                login.name = cryptoService.decrypt(loginData.Name, key);
                login.uri = loginData.Uri && loginData.Uri !== '' ? cryptoService.decrypt(loginData.Uri, key) : null;
                login.username = loginData.Username && loginData.Username !== '' ? cryptoService.decrypt(loginData.Username, key) : null;
                login.password = loginData.Password && loginData.Password !== '' ? cryptoService.decrypt(loginData.Password, key) : null;
                login.notes = loginData.Notes && loginData.Notes !== '' ? cryptoService.decrypt(loginData.Notes, key) : null;
                login.totp = loginData.Totp && loginData.Totp !== '' ? cryptoService.decrypt(loginData.Totp, key) : null;
            }

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
                organizationUseTotp: encryptedCipher.OrganizationUseTotp,
                hasAttachments: !!encryptedCipher.Attachments && encryptedCipher.Attachments.length > 0
            };

            var loginData = encryptedCipher.Data || encryptedCipher;
            if (loginData) {
                login.name = _service.decryptProperty(loginData.Name, key, false);
                login.username = _service.decryptProperty(loginData.Username, key, true);
                login.password = _service.decryptProperty(loginData.Password, key, true);
            }

            return login;
        };

        _service.decryptAttachment = function (key, encryptedAttachment) {
            if (!encryptedAttachment) throw "encryptedAttachment is undefined or null";

            return {
                id: encryptedAttachment.Id,
                url: encryptedAttachment.Url,
                fileName: cryptoService.decrypt(encryptedAttachment.FileName, key),
                size: encryptedAttachment.SizeName
            };
        };

        _service.downloadAndDecryptAttachment = function (key, decryptedAttachment, openDownload) {
            var deferred = $q.defer();
            var req = new XMLHttpRequest();
            req.open('GET', decryptedAttachment.url, true);
            req.responseType = 'arraybuffer';
            req.onload = function (evt) {
                if (!req.response) {
                    deferred.reject('No response');
                    // error
                    return;
                }

                cryptoService.decryptFromBytes(req.response, key).then(function (decBuf) {
                    if (openDownload) {
                        var blob = new Blob([decBuf]);

                        // IE hack. ref http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                        if ($window.navigator.msSaveOrOpenBlob) {
                            $window.navigator.msSaveBlob(blob, decryptedAttachment.fileName);
                        }
                        else {
                            var a = $window.document.createElement('a');
                            a.href = $window.URL.createObjectURL(blob);
                            a.download = decryptedAttachment.fileName;
                            $window.document.body.appendChild(a);
                            a.click();
                            $window.document.body.removeChild(a);
                        }
                    }

                    deferred.resolve(new Uint8Array(decBuf));
                });
            };
            req.send(null);
            return deferred.promise;
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

        _service.encryptLogin = function (unencryptedLogin, key, attachments) {
            if (!unencryptedLogin) throw "unencryptedLogin is undefined or null";

            if (unencryptedLogin.organizationId) {
                key = key || cryptoService.getOrgKey(unencryptedLogin.organizationId);
            }

            var login = {
                id: unencryptedLogin.id,
                'type': 1,
                organizationId: unencryptedLogin.organizationId || null,
                folderId: unencryptedLogin.folderId === '' ? null : unencryptedLogin.folderId,
                favorite: unencryptedLogin.favorite !== null ? unencryptedLogin.favorite : false,
                uri: !unencryptedLogin.uri || unencryptedLogin.uri === '' ? null : cryptoService.encrypt(unencryptedLogin.uri, key),
                name: cryptoService.encrypt(unencryptedLogin.name, key),
                username: !unencryptedLogin.username || unencryptedLogin.username === '' ? null : cryptoService.encrypt(unencryptedLogin.username, key),
                password: !unencryptedLogin.password || unencryptedLogin.password === '' ? null : cryptoService.encrypt(unencryptedLogin.password, key),
                notes: !unencryptedLogin.notes || unencryptedLogin.notes === '' ? null : cryptoService.encrypt(unencryptedLogin.notes, key),
                totp: !unencryptedLogin.totp || unencryptedLogin.totp === '' ? null : cryptoService.encrypt(unencryptedLogin.totp, key)
            };

            if (unencryptedLogin.attachments && attachments) {
                login.attachments = {};
                for (var i = 0; i < unencryptedLogin.attachments.length; i++) {
                    login.attachments[unencryptedLogin.attachments[i].id] =
                        cryptoService.encrypt(unencryptedLogin.attachments[i].fileName, key);
                }
            }

            return login;
        };

        _service.encryptAttachmentFile = function (key, unencryptedFile) {
            var deferred = $q.defer();

            if (unencryptedFile.size > 104857600) { // 100 MB
                deferred.reject('Maximum file size is 100 MB.');
                return;
            }

            var reader = new FileReader();
            reader.readAsArrayBuffer(unencryptedFile);
            reader.onload = function (evt) {
                cryptoService.encryptToBytes(evt.target.result, key).then(function (encData) {
                    deferred.resolve({
                        fileName: cryptoService.encrypt(unencryptedFile.name, key),
                        data: new Uint8Array(encData),
                        size: unencryptedFile.size
                    });
                });
            };
            reader.onerror = function (evt) {
                deferred.reject('Error reading file.');
            };

            return deferred.promise;
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

        return _service;
    });
