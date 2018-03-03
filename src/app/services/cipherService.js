angular
    .module('bit.services')

    .factory('cipherService', function (cryptoService, apiService, $q, $window, constants, appSettings, $localStorage) {
        var _service = {
            disableWebsiteIcons: $localStorage.disableWebsiteIcons
        };

        _service.decryptCiphers = function (encryptedCiphers) {
            if (!encryptedCiphers) throw "encryptedCiphers is undefined or null";

            var unencryptedCiphers = [];
            for (var i = 0; i < encryptedCiphers.length; i++) {
                unencryptedCiphers.push(_service.decryptCipher(encryptedCiphers[i]));
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
                name: cryptoService.decrypt(encryptedCipher.Name, key),
                notes: _service.decryptProperty(encryptedCipher.Notes, key, true, false),
                fields: _service.decryptFields(key, encryptedCipher.Fields),
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                edit: encryptedCipher.Edit,
                organizationUseTotp: encryptedCipher.OrganizationUseTotp,
                attachments: null,
                icon: null
            };

            var i;
            switch (cipher.type) {
                case constants.cipherType.login:
                    cipher.login = {
                        username: _service.decryptProperty(encryptedCipher.Login.Username, key, true, false),
                        password: _service.decryptProperty(encryptedCipher.Login.Password, key, true, false),
                        totp: _service.decryptProperty(encryptedCipher.Login.Totp, key, true, false),
                        uris: null
                    };
                    if (encryptedCipher.Login.Uris) {
                        cipher.login.uris = [];
                        for (i = 0; i < encryptedCipher.Login.Uris.length; i++) {
                            cipher.login.uris.push({
                                uri: _service.decryptProperty(encryptedCipher.Login.Uris[i].Uri, key, true, false),
                                match: encryptedCipher.Login.Uris[i].Match
                            });
                        }
                    }
                    cipher.icon = 'fa-globe';
                    break;
                case constants.cipherType.secureNote:
                    cipher.secureNote = {
                        type: encryptedCipher.SecureNote.Type
                    };
                    cipher.icon = 'fa-sticky-note-o';
                    break;
                case constants.cipherType.card:
                    cipher.card = {
                        cardholderName: _service.decryptProperty(encryptedCipher.Card.CardholderName, key, true, false),
                        number: _service.decryptProperty(encryptedCipher.Card.Number, key, true, false),
                        brand: _service.decryptProperty(encryptedCipher.Card.Brand, key, true, false),
                        expMonth: _service.decryptProperty(encryptedCipher.Card.ExpMonth, key, true, false),
                        expYear: _service.decryptProperty(encryptedCipher.Card.ExpYear, key, true, false),
                        code: _service.decryptProperty(encryptedCipher.Card.Code, key, true, false)
                    };
                    cipher.icon = 'fa-credit-card';
                    break;
                case constants.cipherType.identity:
                    cipher.identity = {
                        title: _service.decryptProperty(encryptedCipher.Identity.Title, key, true, false),
                        firstName: _service.decryptProperty(encryptedCipher.Identity.FirstName, key, true, false),
                        middleName: _service.decryptProperty(encryptedCipher.Identity.MiddleName, key, true, false),
                        lastName: _service.decryptProperty(encryptedCipher.Identity.LastName, key, true, false),
                        address1: _service.decryptProperty(encryptedCipher.Identity.Address1, key, true, false),
                        address2: _service.decryptProperty(encryptedCipher.Identity.Address2, key, true, false),
                        address3: _service.decryptProperty(encryptedCipher.Identity.Address3, key, true, false),
                        city: _service.decryptProperty(encryptedCipher.Identity.City, key, true, false),
                        state: _service.decryptProperty(encryptedCipher.Identity.State, key, true, false),
                        postalCode: _service.decryptProperty(encryptedCipher.Identity.PostalCode, key, true, false),
                        country: _service.decryptProperty(encryptedCipher.Identity.Country, key, true, false),
                        company: _service.decryptProperty(encryptedCipher.Identity.Company, key, true, false),
                        email: _service.decryptProperty(encryptedCipher.Identity.Email, key, true, false),
                        phone: _service.decryptProperty(encryptedCipher.Identity.Phone, key, true, false),
                        ssn: _service.decryptProperty(encryptedCipher.Identity.SSN, key, true, false),
                        username: _service.decryptProperty(encryptedCipher.Identity.Username, key, true, false),
                        passportNumber: _service.decryptProperty(encryptedCipher.Identity.PassportNumber, key, true, false),
                        licenseNumber: _service.decryptProperty(encryptedCipher.Identity.LicenseNumber, key, true, false)
                    };
                    cipher.icon = 'fa-id-card-o';
                    break;
                default:
                    break;
            }

            if (!encryptedCipher.Attachments) {
                return cipher;
            }

            cipher.attachments = [];
            for (i = 0; i < encryptedCipher.Attachments.length; i++) {
                cipher.attachments.push(_service.decryptAttachment(key, encryptedCipher.Attachments[i]));
            }

            return cipher;
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
                name: _service.decryptProperty(encryptedCipher.Name, key, false, true),
                folderId: encryptedCipher.FolderId,
                favorite: encryptedCipher.Favorite,
                edit: encryptedCipher.Edit,
                organizationUseTotp: encryptedCipher.OrganizationUseTotp,
                hasAttachments: !!encryptedCipher.Attachments && encryptedCipher.Attachments.length > 0,
                meta: {},
                icon: null
            };

            switch (cipher.type) {
                case constants.cipherType.login:
                    cipher.subTitle = _service.decryptProperty(encryptedCipher.Login.Username, key, true, true);
                    cipher.meta.password = _service.decryptProperty(encryptedCipher.Login.Password, key, true, true);
                    cipher.meta.uri = null;
                    if (encryptedCipher.Login.Uris && encryptedCipher.Login.Uris.length) {
                        cipher.meta.uri = _service.decryptProperty(encryptedCipher.Login.Uris[0].Uri, key, true, true);
                    }
                    setLoginIcon(cipher, cipher.meta.uri, true);
                    break;
                case constants.cipherType.secureNote:
                    cipher.subTitle = null;
                    cipher.icon = 'fa-sticky-note-o';
                    break;
                case constants.cipherType.card:
                    cipher.subTitle = '';
                    cipher.meta.number = _service.decryptProperty(encryptedCipher.Card.Number, key, true, true);
                    var brand = _service.decryptProperty(encryptedCipher.Card.Brand, key, true, true);
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
                    var firstName = _service.decryptProperty(encryptedCipher.Identity.FirstName, key, true, true);
                    var lastName = _service.decryptProperty(encryptedCipher.Identity.LastName, key, true, true);
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

            return cipher;
        };

        function setLoginIcon(cipher, uri, setImage) {
            if (!_service.disableWebsiteIcons && uri) {
                var hostnameUri = uri,
                    isWebsite = false;

                if (hostnameUri.indexOf('androidapp://') === 0) {
                    cipher.icon = 'fa-android';
                }
                else if (hostnameUri.indexOf('iosapp://') === 0) {
                    cipher.icon = 'fa-apple';
                }
                else if (hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('.') > -1) {
                    hostnameUri = "http://" + hostnameUri;
                    isWebsite = true;
                }
                else {
                    isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > -1;
                }

                if (setImage && isWebsite) {
                    try {
                        var url = new URL(hostnameUri);
                        cipher.meta.image = appSettings.iconsUri + '/' + url.hostname + '/icon.png';
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

        _service.encryptCiphers = function (unencryptedCiphers, key) {
            if (!unencryptedCiphers) throw "unencryptedCiphers is undefined or null";

            var encryptedCiphers = [];
            for (var i = 0; i < unencryptedCiphers.length; i++) {
                encryptedCiphers.push(_service.encryptCipher(unencryptedCiphers[i], null, key));
            }

            return encryptedCiphers;
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

            var i;
            switch (cipher.type) {
                case constants.cipherType.login:
                    var loginData = unencryptedCipher.login;
                    cipher.login = {
                        username: encryptProperty(loginData.username, key),
                        password: encryptProperty(loginData.password, key),
                        totp: encryptProperty(loginData.totp, key)
                    };
                    if (loginData.uris && loginData.uris.length) {
                        cipher.login.uris = [];
                        for (i = 0; i < loginData.uris.length; i++) {
                            cipher.login.uris.push({
                                uri: encryptProperty(loginData.uris[i].uri, key),
                                match: loginData.uris[i].match
                            });
                        }
                    }
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
                for (i = 0; i < unencryptedCipher.attachments.length; i++) {
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
