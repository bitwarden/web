angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService, $q, $window, constants) {
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
                organizationUseTotp: encryptedLogin.OrganizationUseTotp,
                attachments: null
            };

            var loginData = encryptedLogin.Data;
            if (loginData) {
                login.name = cryptoService.decrypt(loginData.Name, key);
                login.uri = loginData.Uri && loginData.Uri !== '' ? cryptoService.decrypt(loginData.Uri, key) : null;
                login.username = loginData.Username && loginData.Username !== '' ? cryptoService.decrypt(loginData.Username, key) : null;
                login.password = loginData.Password && loginData.Password !== '' ? cryptoService.decrypt(loginData.Password, key) : null;
                login.notes = loginData.Notes && loginData.Notes !== '' ? cryptoService.decrypt(loginData.Notes, key) : null;
                login.totp = loginData.Totp && loginData.Totp !== '' ? cryptoService.decrypt(loginData.Totp, key) : null;
                login.fields = _service.decryptFields(key, loginData.Fields);
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

        _service.decryptCiphers = function (encryptedCiphers) {
            if (!encryptedCiphers) throw "encryptedCiphers is undefined or null";

            var unencryptedCiphers = [];
            for (var i = 0; i < encryptedCiphers.length; i++) {
                unencryptedCiphers.push(_service.decryptLogin(encryptedCiphers[i]));
            }

            return unencryptedCiphers;
        };

        _service.decryptCipher = function (encryptedCipher) {
            if (!encryptedCipher) throw "encryptedCipher is undefined or null";

            var key = null;
            if (encryptedCipher.OrganizationId) {
                key = cryptoService.getOrgKey(encryptedCipher.OrganizationId);
            }

            var cipher = {
                id: encryptedCipher.Id,
                organizationId: encryptedCipher.OrganizationId,
                collectionIds: encryptedCipher.CollectionIds || [],
                'type': encryptedCipher.Type,
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                edit: encryptedCipher.Edit,
                organizationUseTotp: encryptedCipher.OrganizationUseTotp,
                attachments: null,
                icon: null
            };

            var cipherData = encryptedCipher.Data;
            if (cipherData) {
                cipher.name = cryptoService.decrypt(cipherData.Name, key);
                cipher.notes = _service.decryptProperty(cipherData.Notes, key, true, false);
                cipher.fields = _service.decryptFields(key, cipherData.Fields);

                var dataObj = {};
                switch (cipher.type) {
                    case constants.cipherType.login:
                        dataObj.uri = _service.decryptProperty(cipherData.Uri, key, true, false);
                        dataObj.username = _service.decryptProperty(cipherData.Username, key, true, false);
                        dataObj.password = _service.decryptProperty(cipherData.Password, key, true, false);
                        dataObj.totp = _service.decryptProperty(cipherData.Totp, key, true, false);
                        cipher.login = dataObj;
                        cipher.icon = 'fa-globe';
                        break;
                    case constants.cipherType.secureNote:
                        dataObj.type = cipherData.Type;
                        cipher.secureNote = dataObj;
                        cipher.icon = 'fa-sticky-note-o';
                        break;
                    case constants.cipherType.card:
                        dataObj.cardholderName = _service.decryptProperty(cipherData.CardholderName, key, true, false);
                        dataObj.number = _service.decryptProperty(cipherData.Number, key, true, false);
                        dataObj.brand = _service.decryptProperty(cipherData.Brand, key, true, false);
                        dataObj.expMonth = _service.decryptProperty(cipherData.ExpMonth, key, true, false);
                        dataObj.expYear = _service.decryptProperty(cipherData.ExpYear, key, true, false);
                        dataObj.code = _service.decryptProperty(cipherData.Code, key, true, false);
                        cipher.card = dataObj;
                        cipher.icon = 'fa-credit-card';
                        break;
                    case constants.cipherType.identity:
                        dataObj.title = _service.decryptProperty(cipherData.Title, key, true, false);
                        dataObj.firstName = _service.decryptProperty(cipherData.FirstName, key, true, false);
                        dataObj.middleName = _service.decryptProperty(cipherData.MiddleName, key, true, false);
                        dataObj.lastName = _service.decryptProperty(cipherData.LastName, key, true, false);
                        dataObj.address1 = _service.decryptProperty(cipherData.Address1, key, true, false);
                        dataObj.address2 = _service.decryptProperty(cipherData.Address2, key, true, false);
                        dataObj.address3 = _service.decryptProperty(cipherData.Address3, key, true, false);
                        dataObj.city = _service.decryptProperty(cipherData.City, key, true, false);
                        dataObj.state = _service.decryptProperty(cipherData.State, key, true, false);
                        dataObj.postalCode = _service.decryptProperty(cipherData.PostalCode, key, true, false);
                        dataObj.country = _service.decryptProperty(cipherData.Country, key, true, false);
                        dataObj.company = _service.decryptProperty(cipherData.Company, key, true, false);
                        dataObj.email = _service.decryptProperty(cipherData.Email, key, true, false);
                        dataObj.phone = _service.decryptProperty(cipherData.Phone, key, true, false);
                        dataObj.ssn = _service.decryptProperty(cipherData.SSN, key, true, false);
                        dataObj.username = _service.decryptProperty(cipherData.Username, key, true, false);
                        dataObj.passportNumber = _service.decryptProperty(cipherData.PassportNumber, key, true, false);
                        dataObj.licenseNumber = _service.decryptProperty(cipherData.LicenseNumber, key, true, false);
                        cipher.identity = dataObj;
                        cipher.icon = 'fa-id-card-o';
                        break;
                    default:
                        break;
                }
            }

            if (!encryptedCipher.Attachments) {
                return cipher;
            }

            cipher.attachments = [];
            for (var i = 0; i < encryptedCipher.Attachments.length; i++) {
                cipher.attachments.push(_service.decryptAttachment(key, encryptedCipher.Attachments[i]));
            }

            return cipher;
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

            var loginData = encryptedCipher.Data;
            if (loginData) {
                login.name = _service.decryptProperty(loginData.Name, key, false, true);
                login.username = _service.decryptProperty(loginData.Username, key, true, true);
                login.password = _service.decryptProperty(loginData.Password, key, true, true);
            }

            return login;
        };

        _service.decryptCipherPreview = function (encryptedCipher) {
            if (!encryptedCipher) throw "encryptedCipher is undefined or null";

            var key = null;
            if (encryptedCipher.OrganizationId) {
                key = cryptoService.getOrgKey(encryptedCipher.OrganizationId);
            }

            var cipher = {
                id: encryptedCipher.Id,
                organizationId: encryptedCipher.OrganizationId,
                collectionIds: encryptedCipher.CollectionIds || [],
                'type': encryptedCipher.Type,
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                edit: encryptedCipher.Edit,
                organizationUseTotp: encryptedCipher.OrganizationUseTotp,
                hasAttachments: !!encryptedCipher.Attachments && encryptedCipher.Attachments.length > 0,
                meta: {},
                icon: null
            };

            var cipherData = encryptedCipher.Data;
            if (cipherData) {
                cipher.name = _service.decryptProperty(cipherData.Name, key, false, true);

                var dataObj = {};
                switch (cipher.type) {
                    case constants.cipherType.login:
                        cipher.subTitle = _service.decryptProperty(cipherData.Username, key, true, true);
                        cipher.meta.password = _service.decryptProperty(cipherData.Password, key, true, true);
                        cipher.meta.uri = _service.decryptProperty(cipherData.Uri, key, true, true);
                        setLoginIcon(cipher, cipher.meta.uri, true);
                        break;
                    case constants.cipherType.secureNote:
                        cipher.subTitle = null;
                        cipher.icon = 'fa-sticky-note-o';
                        break;
                    case constants.cipherType.card:
                        cipher.subTitle = '';
                        cipher.meta.number = _service.decryptProperty(cipherData.Number, key, true, true);
                        var brand = _service.decryptProperty(cipherData.Brand, key, true, true);
                        if (brand) {
                            cipher.subTitle = brand;
                        }
                        if (cipher.meta.number && cipher.meta.number.length >= 4) {
                            if (cipher.subTitle !== '') {
                                cipher.subTitle += ', ';
                            }
                            cipher.subTitle += ('*' + cipher.meta.number.substr(cipher.meta.number.length - 4));
                        }
                        cipher.icon = 'fa-credit-card';
                        break;
                    case constants.cipherType.identity:
                        var firstName = _service.decryptProperty(cipherData.FirstName, key, true, true);
                        var lastName = _service.decryptProperty(cipherData.LastName, key, true, true);
                        cipher.subTitle = '';
                        if (firstName) {
                            cipher.subTitle = firstName;
                        }
                        if (lastName) {
                            if (cipher.subTitle !== '') {
                                cipher.subTitle += ' ';
                            }
                            cipher.subTitle += lastName;
                        }
                        cipher.icon = 'fa-id-card-o';
                        break;
                    default:
                        break;
                }

                if (cipher.subTitle === '') {
                    cipher.subTitle = null;
                }
            }

            return cipher;
        };

        function setLoginIcon(cipher, uri, setImage) {
            if (uri) {
                var hostnameUri = uri,
                    isWebsite = false;

                if (hostnameUri.indexOf('androidapp://') === 0) {
                    cipher.icon = 'fa-android';
                }
                else if (hostnameUri.indexOf('iosapp://') === 0) {
                    cipher.icon = 'fa-apple';
                }
                else if (hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('http://') !== 0 &&
                    hostnameUri.indexOf('https://') !== 0) {
                    hostnameUri = "http://" + hostnameUri;
                    isWebsite = true;
                }
                else {
                    isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > 0;
                }

                if (setImage && isWebsite) {
                    try {
                        var url = new URL(hostnameUri);
                        cipher.meta.image = 'https://icons.bitwarden.com?url=' + url.hostname;
                    }
                    catch (e) { }
                }
            }

            if (!cipher.icon) {
                cipher.icon = 'fa-globe';
            }
        }

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

        _service.decryptFields = function (key, encryptedFields) {
            var unencryptedFields = [];

            if (encryptedFields) {
                for (var i = 0; i < encryptedFields.length; i++) {
                    unencryptedFields.push(_service.decryptField(key, encryptedFields[i]));
                }
            }

            return unencryptedFields;
        };

        _service.decryptField = function (key, encryptedField) {
            if (!encryptedField) throw "encryptedField is undefined or null";

            return {
                type: encryptedField.Type.toString(),
                name: encryptedField.Name && encryptedField.Name !== '' ? cryptoService.decrypt(encryptedField.Name, key) : null,
                value: encryptedField.Value && encryptedField.Value !== '' ? cryptoService.decrypt(encryptedField.Value, key) : null
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
                name: _service.decryptProperty(encryptedFolder.Name, null, false, true)
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
                name: catchError ? _service.decryptProperty(encryptedCollection.Name, key, false, true) :
                    cryptoService.decrypt(encryptedCollection.Name, key)
            };
        };

        _service.decryptProperty = function (property, key, checkEmpty, showError) {
            if (checkEmpty && (!property || property === '')) {
                return null;
            }

            try {
                property = cryptoService.decrypt(property, key);
            }
            catch (err) {
                property = null;
            }

            return property || (showError ? '[error: cannot decrypt]' : null);
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
                name: cryptoService.encrypt(unencryptedLogin.name, key),
                notes: !unencryptedLogin.notes || unencryptedLogin.notes === '' ? null : cryptoService.encrypt(unencryptedLogin.notes, key),
                login: {
                    uri: !unencryptedLogin.uri || unencryptedLogin.uri === '' ? null : cryptoService.encrypt(unencryptedLogin.uri, key),
                    username: !unencryptedLogin.username || unencryptedLogin.username === '' ? null : cryptoService.encrypt(unencryptedLogin.username, key),
                    password: !unencryptedLogin.password || unencryptedLogin.password === '' ? null : cryptoService.encrypt(unencryptedLogin.password, key),
                    totp: !unencryptedLogin.totp || unencryptedLogin.totp === '' ? null : cryptoService.encrypt(unencryptedLogin.totp, key)
                },
                fields: _service.encryptFields(unencryptedLogin.fields, key)
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

        _service.encryptCipher = function (unencryptedCipher, type, key, attachments) {
            if (!unencryptedCipher) throw "unencryptedCipher is undefined or null";

            if (unencryptedCipher.organizationId) {
                key = key || cryptoService.getOrgKey(unencryptedCipher.organizationId);
            }

            var cipher = {
                id: unencryptedCipher.id,
                'type': type || unencryptedCipher.type,
                organizationId: unencryptedCipher.organizationId || null,
                folderId: unencryptedCipher.folderId === '' ? null : unencryptedCipher.folderId,
                favorite: unencryptedCipher.favorite !== null ? unencryptedCipher.favorite : false,
                name: cryptoService.encrypt(unencryptedCipher.name, key),
                notes: encryptProperty(unencryptedCipher.notes, key),
                fields: _service.encryptFields(unencryptedCipher.fields, key)
            };

            switch (cipher.type) {
                case constants.cipherType.login:
                    var loginData = unencryptedCipher.login;
                    cipher.login = {
                        uri: encryptProperty(loginData.uri, key),
                        username: encryptProperty(loginData.username, key),
                        password: encryptProperty(loginData.password, key),
                        totp: encryptProperty(loginData.totp, key)
                    };
                    break;
                case constants.cipherType.secureNote:
                    cipher.secureNote = {
                        type: unencryptedCipher.secureNote.type
                    };
                    break;
                case constants.cipherType.card:
                    var cardData = unencryptedCipher.card;
                    cipher.card = {
                        cardholderName: encryptProperty(cardData.cardholderName, key),
                        brand: encryptProperty(cardData.brand, key),
                        number: encryptProperty(cardData.number, key),
                        expMonth: encryptProperty(cardData.expMonth, key),
                        expYear: encryptProperty(cardData.expYear, key),
                        code: encryptProperty(cardData.code, key)
                    };
                    break;
                case constants.cipherType.identity:
                    var identityData = unencryptedCipher.identity;
                    cipher.identity = {
                        title: encryptProperty(identityData.title, key),
                        firstName: encryptProperty(identityData.firstName, key),
                        middleName: encryptProperty(identityData.middleName, key),
                        lastName: encryptProperty(identityData.lastName, key),
                        address1: encryptProperty(identityData.address1, key),
                        address2: encryptProperty(identityData.address2, key),
                        address3: encryptProperty(identityData.address3, key),
                        city: encryptProperty(identityData.city, key),
                        state: encryptProperty(identityData.state, key),
                        postalCode: encryptProperty(identityData.postalCode, key),
                        country: encryptProperty(identityData.country, key),
                        company: encryptProperty(identityData.company, key),
                        email: encryptProperty(identityData.email, key),
                        phone: encryptProperty(identityData.phone, key),
                        ssn: encryptProperty(identityData.ssn, key),
                        username: encryptProperty(identityData.username, key),
                        passportNumber: encryptProperty(identityData.passportNumber, key),
                        licenseNumber: encryptProperty(identityData.licenseNumber, key)
                    };
                    break;
                default:
                    break;
            }

            if (unencryptedCipher.attachments && attachments) {
                cipher.attachments = {};
                for (var i = 0; i < unencryptedCipher.attachments.length; i++) {
                    cipher.attachments[unencryptedCipher.attachments[i].id] =
                        cryptoService.encrypt(unencryptedCipher.attachments[i].fileName, key);
                }
            }

            return cipher;
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

        _service.encryptFields = function (unencryptedFields, key) {
            if (!unencryptedFields || !unencryptedFields.length) {
                return null;
            }

            var encFields = [];
            for (var i = 0; i < unencryptedFields.length; i++) {
                if (!unencryptedFields[i]) {
                    continue;
                }

                encFields.push(_service.encryptField(unencryptedFields[i], key));
            }

            return encFields;
        };

        _service.encryptField = function (unencryptedField, key) {
            if (!unencryptedField) throw "unencryptedField is undefined or null";

            return {
                type: parseInt(unencryptedField.type),
                name: unencryptedField.name ? cryptoService.encrypt(unencryptedField.name, key) : null,
                value: unencryptedField.value ? cryptoService.encrypt(unencryptedField.value.toString(), key) : null
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

        function encryptProperty(property, key) {
            return !property || property === '' ? null : cryptoService.encrypt(property, key);
        }

        return _service;
    });
