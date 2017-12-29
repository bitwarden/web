angular
    .module('bit.services')

    .factory('importService', function (constants) {
        var _service = {};

        _service.import = function (source, file, success, error) {
            if (!file) {
                error();
                return;
            }

            switch (source) {
                case 'bitwardencsv':
                    importBitwardenCsv(file, success, error);
                    break;
                case 'lastpass':
                    importLastPass(file, success, error, false);
                    break;
                case 'safeincloudxml':
                    importSafeInCloudXml(file, success, error);
                    break;
                case 'keepass2xml':
                    importKeePass2Xml(file, success, error);
                    break;
                case 'keepassxcsv':
                    importKeePassXCsv(file, success, error);
                    break;
                case 'padlockcsv':
                    importPadlockCsv(file, success, error);
                    break;
                case '1password1pif':
                    import1Password1Pif(file, success, error);
                    break;
                case '1password6wincsv':
                    import1Password6WinCsv(file, success, error);
                    break;
                case 'chromecsv':
                case 'vivaldicsv':
                case 'operacsv':
                    importChromeCsv(file, success, error);
                    break;
                case 'firefoxpasswordexportercsvxml':
                    importFirefoxPasswordExporterCsvXml(file, success, error);
                    break;
                case 'upmcsv':
                    importUpmCsv(file, success, error);
                    break;
                case 'keepercsv':
                    importKeeperCsv(file, success, error);
                    break;
                case 'passworddragonxml':
                    importPasswordDragonXml(file, success, error);
                    break;
                case 'enpasscsv':
                    importEnpassCsv(file, success, error);
                    break;
                case 'pwsafexml':
                    importPasswordSafeXml(file, success, error);
                    break;
                case 'dashlanecsv':
                    importDashlaneCsv(file, success, error);
                    break;
                case 'stickypasswordxml':
                    importStickyPasswordXml(file, success, error);
                    break;
                case 'msecurecsv':
                    importmSecureCsv(file, success, error);
                    break;
                case 'truekeycsv':
                    importTrueKeyCsv(file, success, error);
                    break;
                case 'clipperzhtml':
                    importClipperzHtml(file, success, error);
                    break;
                case 'avirajson':
                    importAviraJson(file, success, error);
                    break;
                case 'roboformhtml':
                    importRoboFormHtml(file, success, error);
                    break;
                case 'saferpasscsv':
                    importSaferPassCsv(file, success, error);
                    break;
                case 'ascendocsv':
                    importAscendoCsv(file, success, error);
                    break;
                case 'passwordbossjson':
                    importPasswordBossJson(file, success, error);
                    break;
                case 'zohovaultcsv':
                    importZohoVaultCsv(file, success, error);
                    break;
                case 'splashidcsv':
                    importSplashIdCsv(file, success, error);
                    break;
                case 'meldiumcsv':
                    importMeldiumCsv(file, success, error);
                    break;
                case 'passkeepcsv':
                    importPassKeepCsv(file, success, error);
                    break;
                case 'gnomejson':
                    importGnomeJson(file, success, error);
                    break;
                default:
                    error();
                    break;
            }
        };

        _service.importOrg = function (source, file, success, error) {
            if (!file) {
                error();
                return;
            }

            switch (source) {
                case 'bitwardencsv':
                    importBitwardenOrgCsv(file, success, error);
                    break;
                case 'lastpass':
                    importLastPass(file, success, error, true);
                    break;
                default:
                    error();
                    break;
            }
        };

        // helpers

        var _passwordFieldNames = [
            'password', 'pass word', 'passphrase', 'pass phrase',
            'pass', 'code', 'code word', 'codeword',
            'secret', 'secret word', 'personpwd',
            'key', 'keyword', 'key word', 'keyphrase', 'key phrase',
            'form_pw', 'wppassword', 'pin', 'pwd', 'pw', 'pword', 'passwd',
            'p', 'serial', 'serial#', 'license key', 'reg #',

            // Non-English names
            'passwort'
        ];

        var _usernameFieldNames = [
            'user', 'name', 'user name', 'username', 'login name',
            'email', 'e-mail', 'id', 'userid', 'user id',
            'login', 'form_loginname', 'wpname', 'mail',
            'loginid', 'login id', 'log', 'personlogin',
            'first name', 'last name', 'card#', 'account #',
            'member', 'member #',

            // Non-English names
            'nom', 'benutzername'
        ];

        var _notesFieldNames = [
            "note", "notes", "comment", "comments", "memo",
            "description", "free form", "freeform",
            "free text", "freetext", "free",

            // Non-English names
            "kommentar"
        ];

        var _uriFieldNames = [
            'url', 'hyper link', 'hyperlink', 'link',
            'host', 'hostname', 'host name', 'server', 'address',
            'hyper ref', 'href', 'web', 'website', 'web site', 'site',
            'web-site', 'uri',

            // Non-English names
            'ort', 'adresse'
        ];

        function isField(fieldText, refFieldValues) {
            if (!fieldText || fieldText === '') {
                return false;
            }

            fieldText = fieldText.trim().toLowerCase();

            for (var i = 0; i < refFieldValues.length; i++) {
                if (fieldText === refFieldValues[i]) {
                    return true;
                }
            }

            return false;
        }

        function fixUri(uri) {
            uri = uri.toLowerCase().trim();
            if (!uri.startsWith('http') && uri.indexOf('.') >= 0) {
                uri = 'http://' + uri;
            }

            return trimUri(uri);
        }

        function trimUri(uri) {
            if (uri.length > 1000) {
                return uri.substring(0, 1000);
            }

            return uri;
        }

        function parseCsvErrors(results) {
            if (results.errors && results.errors.length) {
                for (var i = 0; i < results.errors.length; i++) {
                    console.warn('Error parsing row ' + results.errors[i].row + ': ' + results.errors[i].message);
                }
            }
        }

        function getFileContents(file, contentsCallback, errorCallback) {
            if (typeof file === 'string') {
                contentsCallback(file);
            }
            else {
                var reader = new FileReader();
                reader.readAsText(file, 'utf-8');
                reader.onload = function (evt) {
                    contentsCallback(evt.target.result);
                };
                reader.onerror = function (evt) {
                    errorCallback();
                };
            }
        }

        function getXmlFileContents(file, xmlCallback, errorCallback) {
            getFileContents(file, function (fileContents) {
                xmlCallback($.parseXML(fileContents));
            }, errorCallback);
        }

        // ref https://stackoverflow.com/a/5911300
        function getCardType(number) {
            if (!number) {
                return null;
            }

            // Visa
            var re = new RegExp('^4');
            if (number.match(re) != null) {
                return 'Visa';
            }

            // Mastercard 
            // Updated for Mastercard 2017 BINs expansion
            if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number)) {
                return 'Mastercard';
            }

            // AMEX
            re = new RegExp('^3[47]');
            if (number.match(re) != null) {
                return 'Amex';
            }

            // Discover
            re = new RegExp('^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)');
            if (number.match(re) != null) {
                return 'Discover';
            }

            // Diners
            re = new RegExp('^36');
            if (number.match(re) != null) {
                return 'Diners Club';
            }

            // Diners - Carte Blanche
            re = new RegExp('^30[0-5]');
            if (number.match(re) != null) {
                return 'Diners Club';
            }

            // JCB
            re = new RegExp('^35(2[89]|[3-8][0-9])');
            if (number.match(re) != null) {
                return 'JCB';
            }

            // Visa Electron
            re = new RegExp('^(4026|417500|4508|4844|491(3|7))');
            if (number.match(re) != null) {
                return 'Visa';
            }

            return null;
        }

        // importers

        function importBitwardenCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [],
                        i = 0;

                    angular.forEach(results.data, function (value, key) {
                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = value.folder && value.folder !== '',
                            addFolder = hasFolder;

                        if (hasFolder) {
                            for (i = 0; i < folders.length; i++) {
                                if (folders[i].name === value.folder) {
                                    addFolder = false;
                                    folderIndex = i;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            favorite: value.favorite && value.favorite !== '' && value.favorite !== '0' ? true : false,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            type: constants.cipherType.login
                        };

                        if (value.fields && value.fields !== '') {
                            var fields = value.fields.split(/(?:\r\n|\r|\n)/);
                            for (i = 0; i < fields.length; i++) {
                                if (!fields[i] || fields[i] === '') {
                                    continue;
                                }

                                var delimPosition = fields[i].lastIndexOf(': ');
                                if (delimPosition === -1) {
                                    continue;
                                }

                                if (!cipher.fields) {
                                    cipher.fields = [];
                                }

                                var field = {
                                    name: fields[i].substr(0, delimPosition),
                                    value: null,
                                    type: constants.fieldType.text
                                };

                                if (fields[i].length > (delimPosition + 2)) {
                                    field.value = fields[i].substr(delimPosition + 2);
                                }

                                cipher.fields.push(field);
                            }
                        }

                        switch (value.type) {
                            case 'login': case null: case undefined:
                                cipher.type = constants.cipherType.login;

                                var totp = value.login_totp || value.totp;
                                var uri = value.login_uri || value.uri;
                                var username = value.login_username || value.username;
                                var password = value.login_password || value.password;
                                cipher.login = {
                                    totp: totp && totp !== '' ? totp : null,
                                    uri: uri && uri !== '' ? trimUri(uri) : null,
                                    username: username && username !== '' ? username : null,
                                    password: password && password !== '' ? password : null
                                };
                                break;
                            case 'note':
                                cipher.type = constants.cipherType.secureNote;
                                cipher.secureNote = {
                                    type: 0 // generic note
                                };
                                break;
                            default:
                                break;
                        }

                        ciphers.push(cipher);

                        if (addFolder) {
                            folders.push({
                                name: value.folder
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: cipherIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importBitwardenOrgCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var collections = [],
                        ciphers = [],
                        collectionRelationships = [],
                        i;

                    angular.forEach(results.data, function (value, key) {
                        var cipherIndex = ciphers.length;

                        if (value.collections && value.collections !== '') {
                            var cipherCollections = value.collections.split(',');

                            for (i = 0; i < cipherCollections.length; i++) {
                                var addCollection = true;
                                var collectionIndex = collections.length;

                                for (var j = 0; j < collections.length; j++) {
                                    if (collections[j].name === cipherCollections[i]) {
                                        addCollection = false;
                                        collectionIndex = j;
                                        break;
                                    }
                                }

                                if (addCollection) {
                                    collections.push({
                                        name: cipherCollections[i]
                                    });
                                }

                                collectionRelationships.push({
                                    key: cipherIndex,
                                    value: collectionIndex
                                });
                            }
                        }

                        var cipher = {
                            favorite: false,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            type: constants.cipherType.login
                        };

                        if (value.fields && value.fields !== '') {
                            var fields = value.fields.split(/(?:\r\n|\r|\n)/);
                            for (i = 0; i < fields.length; i++) {
                                if (!fields[i] || fields[i] === '') {
                                    continue;
                                }

                                var delimPosition = fields[i].lastIndexOf(': ');
                                if (delimPosition === -1) {
                                    continue;
                                }

                                if (!cipher.fields) {
                                    cipher.fields = [];
                                }

                                var field = {
                                    name: fields[i].substr(0, delimPosition),
                                    value: null,
                                    type: constants.fieldType.text
                                };

                                if (fields[i].length > (delimPosition + 2)) {
                                    field.value = fields[i].substr(delimPosition + 2);
                                }

                                cipher.fields.push(field);
                            }
                        }

                        switch (value.type) {
                            case 'login': case null: case undefined:
                                cipher.type = constants.cipherType.login;

                                var totp = value.login_totp || value.totp;
                                var uri = value.login_uri || value.uri;
                                var username = value.login_username || value.username;
                                var password = value.login_password || value.password;
                                cipher.login = {
                                    totp: totp && totp !== '' ? totp : null,
                                    uri: uri && uri !== '' ? trimUri(uri) : null,
                                    username: username && username !== '' ? username : null,
                                    password: password && password !== '' ? password : null
                                };
                                break;
                            case 'note':
                                cipher.type = constants.cipherType.secureNote;
                                cipher.secureNote = {
                                    type: 0 // generic note
                                };
                                break;
                            default:
                                break;
                        }

                        ciphers.push(cipher);
                    });

                    success(collections, ciphers, collectionRelationships);
                }
            });
        }

        function importLastPass(file, success, error, org) {
            if (typeof file !== 'string' && file.type && file.type === 'text/html') {
                var reader = new FileReader();
                reader.readAsText(file, 'utf-8');
                reader.onload = function (evt) {
                    var doc = $(evt.target.result);
                    var pre = doc.find('pre');
                    var csv, results;

                    if (pre.length === 1) {
                        csv = pre.text().trim();
                        results = Papa.parse(csv, {
                            header: true,
                            encoding: 'UTF-8'
                        });
                        parseData(results.data);
                    }
                    else {
                        var foundPre = false;
                        for (var i = 0; i < doc.length; i++) {
                            if (doc[i].tagName.toLowerCase() === 'pre') {
                                foundPre = true;
                                csv = doc[i].outerText.trim();
                                results = Papa.parse(csv, {
                                    header: true,
                                    encoding: 'UTF-8'
                                });
                                parseData(results.data);
                                break;
                            }
                        }

                        if (!foundPre) {
                            error();
                        }
                    }
                };

                reader.onerror = function (evt) {
                    error();
                };
            }
            else {
                Papa.parse(file, {
                    header: true,
                    encoding: 'UTF-8',
                    complete: function (results) {
                        parseCsvErrors(results);
                        parseData(results.data);
                    },
                    beforeFirstChunk: function (chunk) {
                        return chunk.replace(/^\s+/, '');
                    }
                });
            }

            function parseSecureNoteMapping(extraParts, map, skip) {
                var obj = {
                    dataObj: {},
                    notes: null
                };
                for (var i = 0; i < extraParts.length; i++) {
                    var fieldParts = extraParts[i].split(':');
                    if (fieldParts.length < 1 || fieldParts[0] === 'NoteType' || skip.indexOf(fieldParts[0]) > -1 ||
                        !fieldParts[1] || fieldParts[1] === '') {
                        continue;
                    }

                    if (fieldParts[0] === 'Notes') {
                        if (obj.notes) {
                            obj.notes += ('\n' + fieldParts[1]);
                        }
                        else {
                            obj.notes = fieldParts[1];
                        }
                    }
                    else if (map.hasOwnProperty(fieldParts[0])) {
                        obj.dataObj[map[fieldParts[0]]] = fieldParts[1];
                    }
                    else {
                        if (obj.notes) {
                            obj.notes += '\n';
                        }
                        else {
                            obj.notes = '';
                        }

                        obj.notes += (fieldParts[0] + ': ' + fieldParts[1]);
                    }
                }

                return obj;
            }

            function parseCard(value) {
                var cardData = {
                    cardholderName: value.ccname && value.ccname !== '' ? value.ccname : null,
                    number: value.ccnum && value.ccnum !== '' ? value.ccnum : null,
                    brand: value.ccnum && value.ccnum !== '' ? getCardType(value.ccnum) : null,
                    code: value.cccsc && value.cccsc !== '' ? value.cccsc : null
                };

                if (value.ccexp && value.ccexp !== '' && value.ccexp.indexOf('-') > -1) {
                    var ccexpParts = value.ccexp.split('-');
                    if (ccexpParts.length > 1) {
                        cardData.expYear = ccexpParts[0];
                        cardData.expMonth = ccexpParts[1];
                        if (cardData.expMonth.length === 2 && cardData.expMonth[0] === '0') {
                            cardData.expMonth = cardData.expMonth[1];
                        }
                    }
                }

                return cardData;
            }

            function parseData(data) {
                var folders = [],
                    ciphers = [],
                    cipherRelationships = [],
                    i = 0;

                angular.forEach(data, function (value, key) {
                    var folderIndex = folders.length,
                        cipherIndex = ciphers.length,
                        hasFolder = value.grouping && value.grouping !== '' && value.grouping !== '(none)',
                        addFolder = hasFolder;

                    if (hasFolder) {
                        for (i = 0; i < folders.length; i++) {
                            if (folders[i].name === value.grouping) {
                                addFolder = false;
                                folderIndex = i;
                                break;
                            }
                        }
                    }

                    var cipher;
                    if (value.hasOwnProperty('profilename') && value.hasOwnProperty('profilelanguage')) {
                        // form fill
                        cipher = {
                            favorite: false,
                            name: value.profilename && value.profilename !== '' ? value.profilename : '--',
                            type: constants.cipherType.card
                        };

                        if (value.title !== '' || value.firstname !== '' || value.lastname !== '' ||
                            value.address1 !== '' || value.phone !== '' || value.username !== '' ||
                            value.email !== '') {
                            cipher.type = constants.cipherType.identity;
                        }
                    }
                    else {
                        // site or secure note
                        cipher = {
                            favorite: org ? false : value.fav === '1',
                            name: value.name && value.name !== '' ? value.name : '--',
                            type: value.url === 'http://sn' ? constants.cipherType.secureNote : constants.cipherType.login
                        };
                    }

                    if (cipher.type === constants.cipherType.login) {
                        cipher.login = {
                            uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null
                        };

                        cipher.notes = value.extra && value.extra !== '' ? value.extra : null;
                    }
                    else if (cipher.type === constants.cipherType.secureNote) {
                        var extraParts = value.extra.split(/(?:\r\n|\r|\n)/),
                            processedNote = false;
                        if (extraParts.length) {
                            var typeParts = extraParts[0].split(':');
                            if (typeParts.length > 1 && typeParts[0] === 'NoteType' &&
                                (typeParts[1] === 'Credit Card' || typeParts[1] === 'Address')) {
                                var mappedData = null;
                                if (typeParts[1] === 'Credit Card') {
                                    mappedData = parseSecureNoteMapping(extraParts, {
                                        'Number': 'number',
                                        'Name on Card': 'cardholderName',
                                        'Security Code': 'code'
                                    }, []);
                                    cipher.type = constants.cipherType.card;
                                    cipher.card = mappedData.dataObj;
                                }
                                else if (typeParts[1] === 'Address') {
                                    mappedData = parseSecureNoteMapping(extraParts, {
                                        'Title': 'title',
                                        'First Name': 'firstName',
                                        'Last Name': 'lastName',
                                        'Middle Name': 'middleName',
                                        'Company': 'company',
                                        'Address 1': 'address1',
                                        'Address 2': 'address2',
                                        'Address 3': 'address3',
                                        'City / Town': 'city',
                                        'State': 'state',
                                        'Zip / Postal Code': 'postalCode',
                                        'Country': 'country',
                                        'Email Address': 'email',
                                        'Username': 'username'
                                    }, []);
                                    cipher.type = constants.cipherType.identity;
                                    cipher.identity = mappedData.dataObj;
                                }

                                processedNote = true;
                                cipher.notes = mappedData.notes;
                            }
                        }

                        if (!processedNote) {
                            cipher.secureNote = {
                                type: 0
                            };
                            cipher.notes = value.extra && value.extra !== '' ? value.extra : null;
                        }
                    }
                    else if (cipher.type === constants.cipherType.card) {
                        cipher.card = parseCard(value);
                        cipher.notes = value.notes && value.notes !== '' ? value.notes : null;
                    }
                    else if (cipher.type === constants.cipherType.identity) {
                        cipher.identity = {
                            title: value.title && value.title !== '' ? value.title : null,
                            firstName: value.firstname && value.firstname !== '' ? value.firstname : null,
                            middleName: value.middlename && value.middlename !== '' ? value.middlename : null,
                            lastName: value.lastname && value.lastname !== '' ? value.lastname : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            company: value.company && value.company !== '' ? value.company : null,
                            ssn: value.ssn && value.ssn !== '' ? value.ssn : null,
                            address1: value.address1 && value.address1 !== '' ? value.address1 : null,
                            address2: value.address2 && value.address2 !== '' ? value.address2 : null,
                            address3: value.address3 && value.address3 !== '' ? value.address3 : null,
                            city: value.city && value.city !== '' ? value.city : null,
                            state: value.state && value.state !== '' ? value.state : null,
                            postalCode: value.zip && value.zip !== '' ? value.zip : null,
                            country: value.country && value.country !== '' ? value.country : null,
                            email: value.email && value.email !== '' ? value.email : null,
                            phone: value.phone && value.phone !== '' ? value.phone : null
                        };

                        cipher.notes = value.notes && value.notes !== '' ? value.notes : null;

                        if (cipher.identity.title) {
                            cipher.identity.title = cipher.identity.title.charAt(0).toUpperCase() +
                                cipher.identity.title.slice(1);
                        }

                        if (value.ccnum && value.ccnum !== '') {
                            // there is a card on this identity too
                            var cardCipher = JSON.parse(JSON.stringify(cipher)); // cloned
                            cardCipher.identity = null;
                            cardCipher.type = constants.cipherType.card;
                            cardCipher.card = parseCard(value);
                            ciphers.push(cardCipher);
                        }
                    }

                    ciphers.push(cipher);

                    if (addFolder) {
                        folders.push({
                            name: value.grouping
                        });
                    }

                    if (hasFolder) {
                        var relationship = {
                            key: cipherIndex,
                            value: folderIndex
                        };
                        cipherRelationships.push(relationship);
                    }
                });

                success(folders, ciphers, cipherRelationships);
            }
        }

        function importSafeInCloudXml(file, success, error) {
            var folders = [],
                ciphers = [],
                cipherRelationships = [],
                foldersIndex = [],
                i = 0,
                j = 0;

            getXmlFileContents(file, parse, error);

            function parse(xmlDoc) {
                var xml = $(xmlDoc);

                var db = xml.find('database');
                if (db.length) {
                    var labels = db.find('> label');
                    if (labels.length) {
                        for (i = 0; i < labels.length; i++) {
                            var label = $(labels[i]);
                            foldersIndex[label.attr('id')] = folders.length;
                            folders.push({
                                name: label.attr('name')
                            });
                        }
                    }

                    var cards = db.find('> card');
                    if (cards.length) {
                        for (i = 0; i < cards.length; i++) {
                            var card = $(cards[i]);
                            if (card.attr('template') === 'true') {
                                continue;
                            }

                            var cipher = {
                                favorite: false,
                                notes: '',
                                name: card.attr('title'),
                                fields: null
                            };

                            if (card.attr('type') === 'note') {
                                cipher.type = constants.cipherType.secureNote;
                                cipher.secureNote = {
                                    type: 0 // generic note
                                };
                            }
                            else {
                                cipher.type = constants.cipherType.login;
                                cipher.login = {};

                                var fields = card.find('> field');
                                for (j = 0; j < fields.length; j++) {
                                    var field = $(fields[j]);

                                    var text = field.text();
                                    var type = field.attr('type');
                                    var name = field.attr('name');

                                    if (text && text !== '') {
                                        if (type === 'login') {
                                            cipher.login.username = text;
                                        }
                                        else if (type === 'password') {
                                            cipher.login.password = text;
                                        }
                                        else if (type === 'notes') {
                                            cipher.notes += (text + '\n');
                                        }
                                        else if (type === 'weblogin' || type === 'website') {
                                            cipher.login.uri = trimUri(text);
                                        }
                                        else if (text.length > 200) {
                                            cipher.notes += (name + ': ' + text + '\n');
                                        }
                                        else {
                                            if (!cipher.fields) {
                                                cipher.fields = [];
                                            }
                                            cipher.fields.push({
                                                name: name,
                                                value: text,
                                                type: constants.fieldType.text
                                            });
                                        }
                                    }
                                }
                            }

                            var notes = card.find('> notes');
                            for (j = 0; j < notes.length; j++) {
                                cipher.notes += ($(notes[j]).text() + '\n');
                            }

                            if (cipher.notes === '') {
                                cipher.notes = null;
                            }

                            ciphers.push(cipher);

                            labels = card.find('> label_id');
                            if (labels.length) {
                                var labelId = $(labels[0]).text();
                                var folderIndex = foldersIndex[labelId];
                                if (labelId !== null && labelId !== '' && folderIndex !== null) {
                                    cipherRelationships.push({
                                        key: ciphers.length - 1,
                                        value: folderIndex
                                    });
                                }
                            }
                        }
                    }

                    success(folders, ciphers, cipherRelationships);
                }
                else {
                    error();
                }
            }
        }

        function importPadlockCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    var customFieldHeaders = [];

                    // CSV index ref: 0 = name, 1 = category, 2 = username, 3 = password, 4+ = custom fields

                    var i = 0,
                        j = 0;

                    for (i = 0; i < results.data.length; i++) {
                        var value = results.data[i];
                        if (i === 0) {
                            // header row
                            for (j = 4; j < value.length; j++) {
                                customFieldHeaders.push(value[j]);
                            }

                            continue;
                        }

                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = value[1] && value[1] !== '',
                            addFolder = hasFolder;

                        if (hasFolder) {
                            for (j = 0; j < folders.length; j++) {
                                if (folders[j].name === value[1]) {
                                    addFolder = false;
                                    folderIndex = j;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            favorite: false,
                            type: constants.cipherType.login,
                            notes: null,
                            name: value[0] && value[0] !== '' ? value[0] : '--',
                            login: {
                                uri: null,
                                username: value[2] && value[2] !== '' ? value[2] : null,
                                password: value[3] && value[3] !== '' ? value[3] : null
                            },
                            fields: null
                        };

                        if (customFieldHeaders.length) {
                            for (j = 4; j < value.length; j++) {
                                var cf = value[j];
                                if (!cf || cf === '') {
                                    continue;
                                }

                                var cfHeader = customFieldHeaders[j - 4];
                                if (cfHeader.toLowerCase() === 'url' || cfHeader.toLowerCase() === 'uri') {
                                    cipher.login.uri = trimUri(cf);
                                }
                                else {
                                    if (!cipher.fields) {
                                        cipher.fields = [];
                                    }

                                    cipher.fields.push({
                                        name: cfHeader,
                                        value: cf,
                                        type: constants.fieldType.text
                                    });
                                }
                            }
                        }

                        ciphers.push(cipher);

                        if (addFolder) {
                            folders.push({
                                name: value[1]
                            });
                        }

                        if (hasFolder) {
                            folderRelationships.push({
                                key: cipherIndex,
                                value: folderIndex
                            });
                        }
                    }

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importKeePass2Xml(file, success, error) {
            var folders = [],
                ciphers = [],
                folderRelationships = [];

            getXmlFileContents(file, parse, error);

            function parse(xmlDoc) {
                var xml = $(xmlDoc);

                var root = xml.find('Root');
                if (root.length) {
                    var group = root.find('> Group');
                    if (group.length) {
                        traverse($(group[0]), true, '');
                        success(folders, ciphers, folderRelationships);
                    }
                }
                else {
                    error();
                }
            }

            function traverse(node, isRootNode, groupNamePrefix) {
                var nodeEntries = [];
                var folderIndex = folders.length;
                var groupName = groupNamePrefix;

                if (!isRootNode) {
                    if (groupName !== '') {
                        groupName += ' > ';
                    }
                    groupName += node.find('> Name').text();
                    folders.push({
                        name: groupName
                    });
                }

                var entries = node.find('> Entry');
                if (entries.length) {
                    for (var i = 0; i < entries.length; i++) {
                        var entry = $(entries[i]);
                        var cipherIndex = ciphers.length;
                        var cipher = {
                            favorite: false,
                            notes: null,
                            name: null,
                            type: constants.cipherType.login,
                            login: {
                                uri: null,
                                username: null,
                                password: null
                            },
                            fields: null
                        };

                        var entryStrings = entry.find('> String');
                        for (var j = 0; j < entryStrings.length; j++) {
                            var entryString = $(entryStrings[j]);

                            var key = entryString.find('> Key').text();
                            var value = entryString.find('> Value').text();
                            if (value === '') {
                                continue;
                            }

                            switch (key) {
                                case 'URL':
                                    cipher.login.uri = fixUri(value);
                                    break;
                                case 'UserName':
                                    cipher.login.username = value;
                                    break;
                                case 'Password':
                                    cipher.login.password = value;
                                    break;
                                case 'Title':
                                    cipher.name = value;
                                    break;
                                case 'Notes':
                                    cipher.notes = cipher.notes === null ? value + '\n' : cipher.notes + value + '\n';
                                    break;
                                default:
                                    if (value.length > 200 || value.indexOf('\n') > -1) {
                                        if (!cipher.notes) {
                                            cipher.notes = '';
                                        }

                                        cipher.notes += (key + ': ' + value + '\n');
                                    }
                                    else {
                                        if (!cipher.fields) {
                                            cipher.fields = [];
                                        }

                                        // other custom fields
                                        cipher.fields.push({
                                            name: key,
                                            value: value,
                                            type: constants.fieldType.text
                                        });
                                    }
                                    break;
                            }
                        }

                        if (cipher.name === null) {
                            cipher.name = '--';
                        }

                        ciphers.push(cipher);

                        if (!isRootNode) {
                            folderRelationships.push({
                                key: cipherIndex,
                                value: folderIndex
                            });
                        }
                    }
                }

                var groups = node.find('> Group');
                if (groups.length) {
                    for (var k = 0; k < groups.length; k++) {
                        traverse($(groups[k]), false, groupName);
                    }
                }
            }
        }

        function importKeePassXCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        value.Group = value.Group.startsWith('Root/') ?
                            value.Group.replace('Root/', '') : value.Group;

                        var groupName = value.Group && value.Group !== '' ?
                            value.Group.split('/').join(' > ') : null;

                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = groupName !== null,
                            addFolder = hasFolder,
                            i = 0;

                        if (hasFolder) {
                            for (i = 0; i < folders.length; i++) {
                                if (folders[i].name === groupName) {
                                    addFolder = false;
                                    folderIndex = i;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : null,
                            name: value.Title && value.Title !== '' ? value.Title : '--',
                            login: {
                                uri: value.URL && value.URL !== '' ? fixUri(value.URL) : null,
                                username: value.Username && value.Username !== '' ? value.Username : null,
                                password: value.Password && value.Password !== '' ? value.Password : null
                            }
                        };

                        if (value.Title) {
                            ciphers.push(cipher);
                        }

                        if (addFolder) {
                            folders.push({
                                name: groupName
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: cipherIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function import1Password1Pif(file, success, error) {
            var folders = [],
                ciphers = [],
                i = 0;

            function parseFields(fields, cipher, designationKey, valueKey, nameKey) {
                for (var j = 0; j < fields.length; j++) {
                    var field = fields[j];
                    if (!field[valueKey] || field[valueKey] === '') {
                        continue;
                    }

                    var fieldValue = field[valueKey].toString();

                    if (cipher.type == constants.cipherType.login && !cipher.login.username &&
                        field[designationKey] && field[designationKey] === 'username') {
                        cipher.login.username = fieldValue;
                    }
                    else if (cipher.type == constants.cipherType.login && !cipher.login.password &&
                        field[designationKey] && field[designationKey] === 'password') {
                        cipher.login.password = fieldValue;
                    }
                    else if (cipher.type == constants.cipherType.login && !cipher.login.totp &&
                        field[designationKey] && field[designationKey].startsWith("TOTP_")) {
                        cipher.login.totp = fieldValue;
                    }
                    else if (fieldValue) {
                        var fieldName = (field[nameKey] || 'no_name');
                        if (fieldValue.indexOf('\\n') > -1 || fieldValue.length > 200) {
                            if (cipher.notes === null) {
                                cipher.notes = '';
                            }
                            else {
                                cipher.notes += '\n';
                            }

                            cipher.notes += (fieldName + ': ' +
                                fieldValue.split('\\r\\n').join('\n').split('\\n').join('\n'));
                        }
                        else {
                            if (!cipher.fields) {
                                cipher.fields = [];
                            }

                            cipher.fields.push({
                                name: fieldName,
                                value: fieldValue,
                                type: constants.fieldType.text
                            });
                        }
                    }
                }
            }

            getFileContents(file, parse, error);

            function parse(fileContent) {
                var fileLines = fileContent.split(/(?:\r\n|\r|\n)/);

                for (i = 0; i < fileLines.length; i++) {
                    var line = fileLines[i];
                    if (!line.length || line[0] !== '{') {
                        continue;
                    }

                    var item = JSON.parse(line);
                    var cipher = {
                        type: constants.cipherType.login,
                        favorite: item.openContents && item.openContents.faveIndex ? true : false,
                        notes: null,
                        name: item.title && item.title !== '' ? item.title : '--',
                        fields: null
                    };

                    if (item.typeName === 'securenotes.SecureNote') {
                        cipher.type = constants.cipherType.secureNote;
                        cipher.secureNote = {
                            type: 0 // generic note
                        };
                    }
                    else {
                        cipher.type = constants.cipherType.login;
                        cipher.login = {
                            uri: item.location && item.location !== '' ? fixUri(item.location) : null,
                            username: null,
                            password: null,
                            totp: null
                        };
                    }

                    if (item.secureContents) {
                        if (item.secureContents.notesPlain && item.secureContents.notesPlain !== '') {
                            cipher.notes = item.secureContents.notesPlain
                                .split('\\r\\n').join('\n').split('\\n').join('\n');
                        }

                        if (item.secureContents.fields) {
                            parseFields(item.secureContents.fields, cipher, 'designation', 'value', 'name');
                        }

                        if (item.secureContents.sections) {
                            for (var j = 0; j < item.secureContents.sections.length; j++) {
                                if (item.secureContents.sections[j].fields) {
                                    parseFields(item.secureContents.sections[j].fields, cipher, 'n', 'v', 't');
                                }
                            }
                        }
                    }

                    ciphers.push(cipher);
                }

                success(folders, ciphers, []);
            }
        }

        function import1Password6WinCsv(file, success, error) {
            var folders = [],
                ciphers = [];

            Papa.parse(file, {
                encoding: 'UTF-8',
                header: true,
                complete: function (results) {
                    parseCsvErrors(results);

                    for (var i = 0; i < results.data.length; i++) {
                        var value = results.data[i];
                        if (!value.title) {
                            continue;
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: value.notesPlain && value.notesPlain !== '' ? value.notesPlain : '',
                            name: value.title && value.title !== '' ? value.title : '--',
                            login: {
                                uri: null,
                                username: null,
                                password: null
                            }
                        };

                        for (var property in value) {
                            if (value.hasOwnProperty(property)) {
                                if (value[property] === null || value[property] === '') {
                                    continue;
                                }

                                if (!cipher.login.password && property === 'password') {
                                    cipher.login.password = value[property];
                                }
                                else if (!cipher.login.username && property === 'username') {
                                    cipher.login.username = value[property];
                                }
                                else if (!cipher.login.uri && property === 'urls') {
                                    var urls = value[property].split(/(?:\r\n|\r|\n)/);
                                    cipher.login.uri = fixUri(urls[0]);

                                    for (var j = 1; j < urls.length; j++) {
                                        if (cipher.notes !== '') {
                                            cipher.notes += '\n';
                                        }

                                        cipher.notes += ('url ' + (j + 1) + ': ' + urls[j]);
                                    }
                                }
                                else if (property !== 'ainfo' && property !== 'autosubmit' && property !== 'notesPlain' &&
                                    property !== 'ps' && property !== 'scope' && property !== 'tags' && property !== 'title' &&
                                    property !== 'uuid' && !property.startsWith('section:')) {

                                    if (cipher.notes !== '') {
                                        cipher.notes += '\n';
                                    }

                                    cipher.notes += (property + ': ' + value[property]);
                                }
                            }
                        }

                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }

                        ciphers.push(cipher);
                    }

                    success(folders, ciphers, []);
                }
            });
        }

        function importChromeCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    angular.forEach(results.data, function (value, key) {
                        ciphers.push({
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            login: {
                                uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                                username: value.username && value.username !== '' ? value.username : null,
                                password: value.password && value.password !== '' ? value.password : null
                            }
                        });
                    });

                    success(folders, ciphers, []);
                }
            });
        }

        function importFirefoxPasswordExporterCsvXml(file, success, error) {
            var folders = [],
                ciphers = [];

            function getNameFromHost(host) {
                var name = '--';
                try {
                    if (host && host !== '') {
                        var parser = document.createElement('a');
                        parser.href = host;
                        if (parser.hostname) {
                            name = parser.hostname;
                        }
                    }
                }
                catch (e) {
                    // do nothing
                }

                return name;
            }

            function parseXml(xmlDoc) {
                var xml = $(xmlDoc);

                var entries = xml.find('entry');
                for (var i = 0; i < entries.length; i++) {
                    var entry = $(entries[i]);
                    if (!entry) {
                        continue;
                    }

                    var host = entry.attr('host'),
                        user = entry.attr('user'),
                        password = entry.attr('password');

                    ciphers.push({
                        type: constants.cipherType.login,
                        favorite: false,
                        notes: null,
                        name: getNameFromHost(host),
                        login: {
                            uri: host && host !== '' ? trimUri(host) : null,
                            username: user && user !== '' ? user : null,
                            password: password && password !== '' ? password : null,
                        }
                    });
                }

                success(folders, ciphers, []);
            }

            if (file.type && file.type === 'text/xml') {
                getXmlFileContents(file, parseXml, error);
            }
            else {
                error('Only .xml exports are supported.');
                return;
            }
        }

        function importUpmCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length === 5) {
                            ciphers.push({
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: value[4] && value[4] !== '' ? value[4] : null,
                                name: value[0] && value[0] !== '' ? value[0] : '--',
                                login: {
                                    uri: value[3] && value[3] !== '' ? trimUri(value[3]) : null,
                                    username: value[1] && value[1] !== '' ? value[1] : null,
                                    password: value[2] && value[2] !== '' ? value[2] : null
                                }
                            });
                        }
                    });

                    success(folders, ciphers, []);
                }
            });
        }

        function importKeeperCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length >= 6) {
                            var folderIndex = folders.length,
                                cipherIndex = ciphers.length,
                                hasFolder = value[0] && value[0] !== '',
                                addFolder = hasFolder,
                                i = 0;

                            if (hasFolder) {
                                for (i = 0; i < folders.length; i++) {
                                    if (folders[i].name === value[0]) {
                                        addFolder = false;
                                        folderIndex = i;
                                        break;
                                    }
                                }
                            }

                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: value[5] && value[5] !== '' ? value[5] : null,
                                name: value[1] && value[1] !== '' ? value[1] : '--',
                                login: {
                                    uri: value[4] && value[4] !== '' ? trimUri(value[4]) : null,
                                    username: value[2] && value[2] !== '' ? value[2] : null,
                                    password: value[3] && value[3] !== '' ? value[3] : null
                                },
                                fields: null
                            };

                            if (value.length > 6) {
                                // we have some custom fields.
                                for (i = 6; i < value.length; i = i + 2) {
                                    if (value[i + 1] && value[i + 1].length > 200) {
                                        if (!cipher.notes) {
                                            cipher.notes = '';
                                        }

                                        cipher.notes += (value[i] + ': ' + value[i + 1] + '\n');
                                    }
                                    else {
                                        if (!cipher.fields) {
                                            cipher.fields = [];
                                        }

                                        cipher.fields.push({
                                            name: value[i],
                                            value: value[i + 1],
                                            type: constants.fieldType.text
                                        });
                                    }
                                }
                            }

                            ciphers.push(cipher);

                            if (addFolder) {
                                folders.push({
                                    name: value[0]
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: cipherIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importPasswordDragonXml(file, success, error) {
            var folders = [],
                ciphers = [],
                folderRelationships = [],
                foldersIndex = [],
                j = 0;

            getXmlFileContents(file, parseXml, error);

            function parseXml(xmlDoc) {
                var xml = $(xmlDoc);

                var pwManager = xml.find('PasswordManager');
                if (pwManager.length) {
                    var records = pwManager.find('> record');
                    if (records.length) {
                        for (var i = 0; i < records.length; i++) {
                            var record = $(records[i]);

                            var accountNameNode = record.find('> Account-Name'),
                                accountName = accountNameNode.length ? $(accountNameNode) : null,
                                userIdNode = record.find('> User-Id'),
                                userId = userIdNode.length ? $(userIdNode) : null,
                                passwordNode = record.find('> Password'),
                                password = passwordNode.length ? $(passwordNode) : null,
                                urlNode = record.find('> URL'),
                                url = urlNode.length ? $(urlNode) : null,
                                notesNode = record.find('> Notes'),
                                notes = notesNode.length ? $(notesNode) : null,
                                categoryNode = record.find('> Category'),
                                category = categoryNode.length ? $(categoryNode) : null,
                                categoryText = category ? category.text() : null;

                            var folderIndex = folders.length,
                                cipherIndex = ciphers.length,
                                hasFolder = categoryText && categoryText !== '' && categoryText !== 'Unfiled',
                                addFolder = hasFolder;

                            if (hasFolder) {
                                for (j = 0; j < folders.length; j++) {
                                    if (folders[j].name === categoryText) {
                                        addFolder = false;
                                        folderIndex = j;
                                        break;
                                    }
                                }
                            }

                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: notes && notes.text() !== '' ? notes.text() : null,
                                name: accountName && accountName.text() !== '' ? accountName.text() : '--',
                                login: {
                                    uri: url && url.text() !== '' ? trimUri(url.text()) : null,
                                    username: userId && userId.text() !== '' ? userId.text() : null,
                                    password: password && password.text() !== '' ? password.text() : null
                                },
                                fields: null
                            };

                            var attributesSelector = '';
                            for (j = 1; j <= 10; j++) {
                                attributesSelector += '> Attribute-' + j;
                                if (j < 10) {
                                    attributesSelector += ', ';
                                }
                            }

                            var attributes = record.find(attributesSelector);
                            if (attributes.length) {
                                // we have some attributes. add them as fields
                                for (j = 0; j < attributes.length; j++) {
                                    var attr = $(attributes[j]),
                                        attrName = attr.prop('tagName'),
                                        attrValue = attr.text();

                                    if (!attrValue || attrValue === '' || attrValue === 'null') {
                                        continue;
                                    }

                                    if (attrValue.length > 200) {
                                        if (!cipher.notes) {
                                            cipher.notes = '';
                                        }

                                        cipher.notes += (attrName + ': ' + attrValue + '\n');
                                    }
                                    else {
                                        if (!cipher.fields) {
                                            cipher.fields = [];
                                        }

                                        cipher.fields.push({
                                            name: attrName,
                                            value: attrValue,
                                            type: constants.fieldType.text
                                        });
                                    }
                                }
                            }

                            ciphers.push(cipher);

                            if (addFolder) {
                                folders.push({
                                    name: categoryText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: cipherIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, ciphers, folderRelationships);
                }
                else {
                    error();
                }
            }
        }

        function importEnpassCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        if (row.length < 2) {
                            continue;
                        }
                        if (j === 0 && row[0] === 'Title') {
                            continue;
                        }

                        var note = row[row.length - 1];
                        var cipher = {
                            type: constants.cipherType.login,
                            name: row[0],
                            favorite: false,
                            notes: note && note !== '' ? note : null,
                            fields: null,
                            login: {
                                uri: null,
                                password: null,
                                username: null,
                                totp: null
                            }
                        };

                        if (row.length > 2 && (row.length % 2) === 0) {
                            for (var i = 0; i < row.length - 2; i += 2) {
                                var value = row[i + 2];
                                if (!value || value === '') {
                                    continue;
                                }

                                var field = row[i + 1];
                                var fieldLower = field.toLowerCase();

                                if (fieldLower === 'url' && !cipher.login.uri) {
                                    cipher.login.uri = trimUri(value);
                                }
                                else if ((fieldLower === 'username' || fieldLower === 'email') && !cipher.login.username) {
                                    cipher.login.username = value;
                                }
                                else if (fieldLower === 'password' && !cipher.login.password) {
                                    cipher.login.password = value;
                                }
                                else if (fieldLower === 'totp' && !cipher.login.totp) {
                                    cipher.login.totp = value;
                                }
                                else if (value.length > 200) {
                                    if (!cipher.notes) {
                                        cipher.notes = '';
                                    }

                                    cipher.notes += (field + ': ' + value + '\n');
                                }
                                else {
                                    // other fields
                                    if (!cipher.fields) {
                                        cipher.fields = [];
                                    }

                                    cipher.fields.push({
                                        name: field,
                                        value: value,
                                        type: constants.fieldType.text
                                    });
                                }
                            }
                        }

                        ciphers.push(cipher);
                    }

                    success(folders, ciphers, []);
                }
            });
        }

        function importPasswordSafeXml(file, success, error) {
            var folders = [],
                ciphers = [],
                folderRelationships = [],
                foldersIndex = [],
                j = 0;

            getXmlFileContents(file, parseXml, error);

            function parseXml(xmlDoc) {
                var xml = $(xmlDoc);

                var pwsafe = xml.find('passwordsafe');
                if (pwsafe.length) {
                    var notesDelimiter = pwsafe.attr('delimiter');

                    var entries = pwsafe.find('> entry');
                    if (entries.length) {
                        for (var i = 0; i < entries.length; i++) {
                            var entry = $(entries[i]);

                            var titleNode = entry.find('> title'),
                                title = titleNode.length ? $(titleNode) : null,
                                usernameNode = entry.find('> username'),
                                username = usernameNode.length ? $(usernameNode) : null,
                                emailNode = entry.find('> email'),
                                email = emailNode.length ? $(emailNode) : null,
                                emailText = email ? email.text() : null,
                                passwordNode = entry.find('> password'),
                                password = passwordNode.length ? $(passwordNode) : null,
                                urlNode = entry.find('> url'),
                                url = urlNode.length ? $(urlNode) : null,
                                notesNode = entry.find('> notes'),
                                notes = notesNode.length ? $(notesNode) : null,
                                notesText = notes ? notes.text().split(notesDelimiter).join('\n') : null,
                                groupNode = entry.find('> group'),
                                group = groupNode.length ? $(groupNode) : null,
                                groupText = group ? group.text().split('.').join(' > ') : null;

                            var folderIndex = folders.length,
                                cipherIndex = ciphers.length,
                                hasFolder = groupText && groupText !== '',
                                addFolder = hasFolder;

                            if (hasFolder) {
                                for (j = 0; j < folders.length; j++) {
                                    if (folders[j].name === groupText) {
                                        addFolder = false;
                                        folderIndex = j;
                                        break;
                                    }
                                }
                            }

                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: notes && notesText !== '' ? notesText : null,
                                name: title && title.text() !== '' ? title.text() : '--',
                                login: {
                                    uri: url && url.text() !== '' ? trimUri(url.text()) : null,
                                    username: username && username.text() !== '' ? username.text() : null,
                                    password: password && password.text() !== '' ? password.text() : null
                                }
                            };

                            if (!cipher.login.username && emailText && emailText !== '') {
                                cipher.login.username = emailText;
                            }
                            else if (emailText && emailText !== '') {
                                cipher.notes = cipher.notes === null ? 'Email: ' + emailText
                                    : cipher.notes + '\n' + 'Email: ' + emailText;
                            }

                            ciphers.push(cipher);

                            if (addFolder) {
                                folders.push({
                                    name: groupText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: cipherIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, ciphers, folderRelationships);
                }
                else {
                    error();
                }
            }
        }

        function importDashlaneCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var skip = false;
                        var row = results.data[j];
                        if (!row.length || row.length === 1) {
                            continue;
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            name: row[0] && row[0] !== '' ? row[0] : '--',
                            favorite: false,
                            notes: null,
                            login: {
                                uri: null,
                                password: null,
                                username: null
                            }
                        };

                        if (row.length === 2) {
                            cipher.login.uri = fixUri(row[1]);
                        }
                        else if (row.length === 3) {
                            cipher.login.uri = fixUri(row[1]);
                            cipher.login.username = row[2];
                        }
                        else if (row.length === 4) {
                            if (row[2] === '' && row[3] === '') {
                                cipher.login.username = row[1];
                                cipher.notes = row[2] + '\n' + row[3];
                            }
                            else {
                                cipher.login.username = row[2];
                                cipher.notes = row[1] + '\n' + row[3];
                            }
                        }
                        else if (row.length === 5) {
                            cipher.login.uri = fixUri(row[1]);
                            cipher.login.username = row[2];
                            cipher.login.password = row[3];
                            cipher.notes = row[4];
                        }
                        else if (row.length === 6) {
                            if (row[2] === '') {
                                cipher.login.username = row[3];
                                cipher.login.password = row[4];
                                cipher.notes = row[5];
                            }
                            else {
                                cipher.login.username = row[2];
                                cipher.login.password = row[3];
                                cipher.notes = row[4] + '\n' + row[5];
                            }

                            cipher.login.uri = fixUri(row[1]);
                        }
                        else if (row.length === 7) {
                            if (row[2] === '') {
                                cipher.login.username = row[3];
                                cipher.notes = row[4] + '\n' + row[6];
                            }
                            else {
                                cipher.login.username = row[2];
                                cipher.notes = row[3] + '\n' + row[4] + '\n' + row[6];
                            }

                            cipher.login.uri = fixUri(row[1]);
                            cipher.login.password = row[5];
                        }
                        else {
                            cipher.notes = '';
                            for (var i = 1; i < row.length; i++) {
                                cipher.notes = cipher.notes + row[i] + '\n';
                                if (row[i] === 'NO_TYPE') {
                                    skip = true;
                                    break;
                                }
                            }
                        }

                        if (skip) {
                            continue;
                        }

                        if (cipher.login.username === '') {
                            cipher.login.username = null;
                        }
                        if (cipher.login.password === '') {
                            cipher.login.password = null;
                        }
                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }
                        if (cipher.login.uri === '') {
                            cipher.login.uri = null;
                        }

                        ciphers.push(cipher);
                    }

                    success(folders, ciphers, []);
                }
            });
        }

        function importStickyPasswordXml(file, success, error) {
            var folders = [],
                ciphers = [],
                folderRelationships = [],
                foldersIndex = [],
                j = 0;

            function buildGroupText(database, groupId, groupText) {
                var group = database.find('> Groups > Group[ID="' + groupId + '"]');
                if (group.length) {
                    if (groupText && groupText !== '') {
                        groupText = ' > ' + groupText;
                    }
                    groupText = group.attr('Name') + groupText;
                    var parentGroupId = group.attr('ParentID');
                    return buildGroupText(database, parentGroupId, groupText);
                }
                return groupText;
            }

            getXmlFileContents(file, parseXml, error);

            function parseXml(xmlDoc) {
                var xml = $(xmlDoc);

                var database = xml.find('root > Database');
                if (database.length) {
                    var loginNodes = database.find('> Logins > Login');
                    if (loginNodes.length) {
                        for (var i = 0; i < loginNodes.length; i++) {
                            var loginNode = $(loginNodes[i]);

                            var usernameText = loginNode.attr('Name'),
                                passwordText = loginNode.attr('Password'),
                                accountId = loginNode.attr('ID'),
                                titleText = null,
                                linkText = null,
                                notesText = null,
                                groupId = null,
                                groupText = null;

                            if (accountId && accountId !== '') {
                                var accountLogin =
                                    database.find('> Accounts > Account > LoginLinks > Login[SourceLoginID="' + accountId + '"]');
                                if (accountLogin.length) {
                                    var account = accountLogin.parent().parent();
                                    if (account.length) {
                                        titleText = account.attr('Name');
                                        linkText = account.attr('Link');
                                        groupId = account.attr('ParentID');
                                        notesText = account.attr('Comments');
                                        if (notesText) {
                                            notesText = notesText.split('/n').join('\n');
                                        }
                                    }
                                }
                            }

                            if (groupId && groupId !== '') {
                                groupText = buildGroupText(database, groupId, '');
                            }

                            var folderIndex = folders.length,
                                cipherIndex = ciphers.length,
                                hasFolder = groupText && groupText !== '',
                                addFolder = hasFolder;

                            if (hasFolder) {
                                for (j = 0; j < folders.length; j++) {
                                    if (folders[j].name === groupText) {
                                        addFolder = false;
                                        folderIndex = j;
                                        break;
                                    }
                                }
                            }

                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: notesText && notesText !== '' ? notesText : null,
                                name: titleText && titleText !== '' ? titleText : '--',
                                login: {
                                    uri: linkText && linkText !== '' ? trimUri(linkText) : null,
                                    username: usernameText && usernameText !== '' ? usernameText : null,
                                    password: passwordText && passwordText !== '' ? passwordText : null
                                }
                            };

                            ciphers.push(cipher);

                            if (addFolder) {
                                folders.push({
                                    name: groupText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: cipherIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, ciphers, folderRelationships);
                }
                else {
                    error();
                }
            }
        }

        function importmSecureCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length >= 3) {
                            var folderIndex = folders.length,
                                cipherIndex = ciphers.length,
                                hasFolder = value[0] && value[0] !== '' && value[0] !== 'Unassigned',
                                addFolder = hasFolder,
                                i = 0;

                            if (hasFolder) {
                                for (i = 0; i < folders.length; i++) {
                                    if (folders[i].name === value[0]) {
                                        addFolder = false;
                                        folderIndex = i;
                                        break;
                                    }
                                }
                            }

                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: false,
                                notes: '',
                                name: value[2] && value[2] !== '' ? value[2] : null,
                                login: {
                                    uri: null,
                                    username: null,
                                    password: null
                                }
                            };

                            if (value[1] === 'Web Logins') {
                                cipher.login.uri = value[4] && value[4] !== '' ? trimUri(value[4]) : null;
                                cipher.login.username = value[5] && value[5] !== '' ? value[5] : null;
                                cipher.login.password = value[6] && value[6] !== '' ? value[6] : null;
                                cipher.notes = value[3] && value[3] !== '' ? value[3].split('\\n').join('\n') : null;
                            }
                            else if (value.length > 3) {
                                for (var j = 3; j < value.length; j++) {
                                    if (value[j] && value[j] !== '') {
                                        if (cipher.notes !== '') {
                                            cipher.notes = cipher.notes + '\n';
                                        }

                                        cipher.notes = cipher.notes + value[j];
                                    }
                                }
                            }

                            if (value[1] && value[1] !== '' && value[1] !== 'Web Logins') {
                                cipher.name = value[1] + ': ' + cipher.name;
                            }

                            if (cipher.notes === '') {
                                cipher.notes = null;
                            }

                            ciphers.push(cipher);

                            if (addFolder) {
                                folders.push({
                                    name: value[0]
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: cipherIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importTrueKeyCsv(file, success, error) {
            var folders = [],
                ciphers = [],
                propsToIgnore = [
                    'kind',
                    'autologin',
                    'favorite',
                    'hexcolor',
                    'protectedwithpassword',
                    'subdomainonly',
                    'type',
                    'tk_export_version',
                    'note',
                    'title',
                    'document_content'
                ];

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    angular.forEach(results.data, function (value, key) {
                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: value.favorite && value.favorite.toLowerCase() === 'true' ? true : false,
                            notes: value.memo && value.memo !== '' ? value.memo : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            login: {
                                uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                                username: value.login && value.login !== '' ? value.login : null,
                                password: value.password && value.password !== '' ? value.password : null
                            },
                            fields: null
                        };

                        if (value.kind !== 'login') {
                            cipher.name = value.title && value.title !== '' ? value.title : '--';
                            cipher.notes = value.note && value.note !== '' ? value.note : null;

                            if (!cipher.notes) {
                                cipher.notes = value.document_content && value.document_content !== '' ?
                                    value.document_content : null;
                            }

                            for (var property in value) {
                                if (value.hasOwnProperty(property) && propsToIgnore.indexOf(property.toLowerCase()) < 0 &&
                                    value[property] && value[property] !== '') {
                                    if (value[property].length > 200) {
                                        if (!cipher.notes) {
                                            cipher.notes = '';
                                        }

                                        cipher.notes += (property + ': ' + value[property] + '\n');
                                    }
                                    else {
                                        if (!cipher.fields) {
                                            cipher.fields = [];
                                        }

                                        // other custom fields
                                        cipher.fields.push({
                                            name: property,
                                            value: value[property],
                                            type: constants.fieldType.text
                                        });
                                    }
                                }
                            }
                        }

                        ciphers.push(cipher);
                    });

                    success(folders, ciphers, []);
                }
            });
        }

        function importClipperzHtml(file, success, error) {
            var folders = [],
                ciphers = [];

            getFileContents(file, parse, error);

            function parse(fileContents) {
                var doc = $(fileContents);
                var textarea = doc.find('textarea');
                var json = textarea && textarea.length ? textarea.val() : null;
                var entries = json ? JSON.parse(json) : null;

                if (entries && entries.length) {
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: '',
                            name: entry.label && entry.label !== '' ? entry.label.split(' ')[0] : '--',
                            login: {
                                uri: null,
                                username: null,
                                password: null
                            },
                            fields: null
                        };

                        if (entry.data && entry.data.notes && entry.data.notes !== '') {
                            cipher.notes = entry.data.notes.split('\\n').join('\n');
                        }

                        if (entry.currentVersion && entry.currentVersion.fields) {
                            for (var property in entry.currentVersion.fields) {
                                if (entry.currentVersion.fields.hasOwnProperty(property)) {
                                    var field = entry.currentVersion.fields[property];
                                    var actionType = field.actionType.toLowerCase();

                                    switch (actionType) {
                                        case 'password':
                                            cipher.login.password = field.value;
                                            break;
                                        case 'email':
                                        case 'username':
                                        case 'user':
                                        case 'name':
                                            cipher.login.username = field.value;
                                            break;
                                        case 'url':
                                            cipher.login.uri = trimUri(field.value);
                                            break;
                                        default:
                                            if (!cipher.login.username && isField(field.label, _usernameFieldNames)) {
                                                cipher.login.username = field.value;
                                            }
                                            else if (!cipher.login.password && isField(field.label, _passwordFieldNames)) {
                                                cipher.login.password = field.value;
                                            }
                                            else if (field.value.length > 200) {
                                                if (!cipher.notes) {
                                                    cipher.notes = '';
                                                }

                                                cipher.notes += (field.label + ': ' + field.value + '\n');
                                            }
                                            else {
                                                if (!cipher.fields) {
                                                    cipher.fields = [];
                                                }
                                                cipher.fields.push({
                                                    name: field.label,
                                                    value: field.value,
                                                    type: constants.fieldType.text
                                                });
                                            }
                                            break;
                                    }
                                }
                            }
                        }

                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }

                        ciphers.push(cipher);
                    }
                }

                success(folders, ciphers, []);
            }
        }

        function importAviraJson(file, success, error) {
            var folders = [],
                ciphers = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                if (fileJson) {
                    if (fileJson.accounts) {
                        for (i = 0; i < fileJson.accounts.length; i++) {
                            var account = fileJson.accounts[i];
                            var cipher = {
                                type: constants.cipherType.login,
                                favorite: account.is_favorite && account.is_favorite === true,
                                notes: null,
                                name: account.label && account.label !== '' ? account.label : account.domain,
                                login: {
                                    uri: account.domain && account.domain !== '' ? fixUri(account.domain) : null,
                                    username: account.username && account.username !== '' ? account.username : null,
                                    password: account.password && account.password !== '' ? account.password : null
                                }
                            };

                            if (account.email && account.email !== '') {
                                if (!cipher.login.username || cipher.login.username === '') {
                                    cipher.login.username = account.email;
                                }
                                else {
                                    cipher.notes = account.email;
                                }
                            }

                            if (!cipher.name || cipher.name === '') {
                                cipher.name = '--';
                            }

                            ciphers.push(cipher);
                        }
                    }
                }

                success(folders, ciphers, []);
            }
        }

        function importRoboFormHtml(file, success, error) {
            var folders = [],
                ciphers = [];

            getFileContents(file, parse, error);

            function parse(fileContents) {
                var doc = $(fileContents.split('&shy;').join('').split('<WBR>').join(''));
                var outterTables = doc.find('table.nobr');
                if (outterTables.length) {
                    for (var i = 0; i < outterTables.length; i++) {
                        var outterTable = $(outterTables[i]);
                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: '',
                            name: outterTable.find('span.caption').text(),
                            login: {
                                uri: null,
                                username: null,
                                password: null
                            },
                            fields: null
                        };

                        var url = outterTable.find('.subcaption').text();
                        if (url && url !== '') {
                            cipher.login.uri = fixUri(url);
                        }

                        var fields = [];
                        /* jshint ignore:start */
                        $.each(outterTable.find('table td:not(.subcaption)'), function (indexInArray, valueOfElement) {
                            $(valueOfElement).find('br').replaceWith('\n');
                            var t = $(valueOfElement).text();
                            if (t !== '') {
                                fields.push(t.split('\\n').join('\n'));
                            }
                        });
                        /* jshint ignore:end */

                        if (fields.length && (fields.length % 2 === 0))
                            for (var j = 0; j < fields.length; j += 2) {
                                var field = fields[j];
                                var fieldValue = fields[j + 1];

                                if (!cipher.login.password && isField(field.replace(':', ''), _passwordFieldNames)) {
                                    cipher.login.password = fieldValue;
                                }
                                else if (!cipher.login.username && isField(field.replace(':', ''), _usernameFieldNames)) {
                                    cipher.login.username = fieldValue;
                                }
                                else if (fieldValue.length > 200) {
                                    if (!cipher.notes) {
                                        cipher.notes = '';
                                    }

                                    cipher.notes += (field + ': ' + fieldValue + '\n');
                                }
                                else {
                                    if (!cipher.fields) {
                                        cipher.fields = [];
                                    }

                                    cipher.fields.push({
                                        name: field,
                                        value: fieldValue,
                                        type: constants.fieldType.text
                                    });
                                }
                            }

                        if (!cipher.notes || cipher.notes === '') {
                            cipher.notes = null;
                        }

                        if (!cipher.name || cipher.name === '') {
                            cipher.name = '--';
                        }

                        ciphers.push(cipher);
                    }
                }

                success(folders, ciphers, []);
            }
        }

        function importSaferPassCsv(file, success, error) {
            function urlDomain(data) {
                var a = document.createElement('a');
                a.href = data;
                return a.hostname.startsWith('www.') ? a.hostname.replace('www.', '') : a.hostname;
            }

            var folders = [],
                ciphers = [];

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    angular.forEach(results.data, function (value, key) {
                        ciphers.push({
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.url && value.url !== '' ? urlDomain(value.url) : '--',
                            login: {
                                uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                                username: value.username && value.username !== '' ? value.username : null,
                                password: value.password && value.password !== '' ? value.password : null
                            }
                        });
                    });

                    success(folders, ciphers, []);
                }
            });
        }

        function importAscendoCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        if (row.length < 2) {
                            continue;
                        }

                        var note = row[row.length - 1];
                        var cipher = {
                            type: constants.cipherType.login,
                            name: row[0],
                            favorite: false,
                            notes: note && note !== '' ? note : null,
                            login: {
                                uri: null,
                                password: null,
                                username: null
                            },
                            fields: null
                        };

                        if (row.length > 2 && (row.length % 2) === 0) {
                            for (var i = 0; i < row.length - 2; i += 2) {
                                var value = row[i + 2];
                                var field = row[i + 1];
                                if (!field || field === '' || !value || value === '') {
                                    continue;
                                }

                                var fieldLower = field.toLowerCase();

                                if (!cipher.login.uri && isField(field, _uriFieldNames)) {
                                    cipher.login.uri = fixUri(value);
                                }
                                else if (!cipher.login.username && isField(field, _usernameFieldNames)) {
                                    cipher.login.username = value;
                                }
                                else if (!cipher.login.password && isField(field, _passwordFieldNames)) {
                                    cipher.login.password = value;
                                }
                                else if (value.length > 200) {
                                    if (!cipher.notes) {
                                        cipher.notes = '';
                                    }

                                    cipher.notes += (field + ': ' + value + '\n');
                                }
                                else {
                                    if (!cipher.fields) {
                                        cipher.fields = [];
                                    }

                                    // other custom fields
                                    cipher.fields.push({
                                        name: field,
                                        value: value,
                                        type: constants.fieldType.text
                                    });
                                }
                            }
                        }

                        ciphers.push(cipher);
                    }

                    success(folders, ciphers, []);
                }
            });
        }

        function importPasswordBossJson(file, success, error) {
            var folders = [],
                ciphers = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                if (fileJson && fileJson.length) {
                    for (i = 0; i < fileJson.length; i++) {
                        var item = fileJson[i];

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: '',
                            name: item.name && item.name !== '' ? item.name : '--',
                            login: {
                                uri: item.login_url && item.login_url !== '' ? fixUri(item.login_url) : null,
                                username: null,
                                password: null
                            },
                            fields: null
                        };

                        if (!item.identifiers) {
                            continue;
                        }

                        if (item.identifiers.notes && item.identifiers.notes !== '') {
                            cipher.notes = item.identifiers.notes.split('\\r\\n').join('\n').split('\\n').join('\n');
                        }

                        for (var property in item.identifiers) {
                            if (item.identifiers.hasOwnProperty(property)) {
                                var value = item.identifiers[property];
                                if (property === 'notes' || value === '' || value === null) {
                                    continue;
                                }

                                if (property === 'username') {
                                    cipher.login.username = value;
                                }
                                else if (property === 'password') {
                                    cipher.login.password = value;
                                }
                                else if (value.length > 200) {
                                    if (!cipher.notes) {
                                        cipher.notes = '';
                                    }

                                    cipher.notes += (property + ': ' + value + '\n');
                                }
                                else {
                                    if (!cipher.fields) {
                                        cipher.fields = [];
                                    }

                                    cipher.fields.push({
                                        name: property,
                                        value: value,
                                        type: constants.fieldType.text
                                    });
                                }
                            }
                        }

                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }

                        ciphers.push(cipher);
                    }
                }

                success(folders, ciphers, []);
            }
        }

        function importZohoVaultCsv(file, success, error) {
            function parseData(data, cipher) {
                if (!data || data === '') {
                    return;
                }

                var dataLines = data.split(/(?:\r\n|\r|\n)/);
                for (var i = 0; i < dataLines.length; i++) {
                    var line = dataLines[i];
                    var delimPosition = line.indexOf(':');
                    if (delimPosition < 0) {
                        continue;
                    }

                    var field = line.substring(0, delimPosition);
                    var value = line.length > delimPosition ? line.substring(delimPosition + 1) : null;
                    if (!field || field === '' || !value || value === '' || field === 'SecretType') {
                        continue;
                    }

                    var fieldLower = field.toLowerCase();
                    if (fieldLower === 'user name') {
                        cipher.login.username = value;
                    }
                    else if (fieldLower === 'password') {
                        cipher.login.password = value;
                    }
                    else if (value.length > 200) {
                        if (!cipher.notes) {
                            cipher.notes = '';
                        }

                        cipher.notes += (field + ': ' + value + '\n');
                    }
                    else {
                        if (!cipher.fields) {
                            cipher.fields = [];
                        }

                        cipher.fields.push({
                            name: field,
                            value: value,
                            type: constants.fieldType.text
                        });
                    }
                }
            }

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        var chamber = value.ChamberName;

                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = chamber && chamber !== '',
                            addFolder = hasFolder,
                            i = 0;

                        if (hasFolder) {
                            for (i = 0; i < folders.length; i++) {
                                if (folders[i].name === chamber) {
                                    addFolder = false;
                                    folderIndex = i;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: value.Favorite && value.Favorite === '1' ? true : false,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : '',
                            name: value['Secret Name'] && value['Secret Name'] !== '' ? value['Secret Name'] : '--',
                            login: {
                                uri: value['Secret URL'] && value['Secret URL'] !== '' ? fixUri(value['Secret URL']) : null,
                                username: null,
                                password: null
                            },
                            fields: null
                        };

                        parseData(value.SecretData, cipher);
                        parseData(value.CustomData, cipher);

                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }

                        if (value['Secret Name']) {
                            ciphers.push(cipher);
                        }

                        if (addFolder) {
                            folders.push({
                                name: chamber
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: cipherIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importSplashIdCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    function parseFieldsToNotes(startIndex, row, cipher) {
                        // last 3 rows do not get parsed
                        for (var k = startIndex; k < row.length - 3; k++) {
                            if (!row[k] || row[k] === '') {
                                continue;
                            }

                            if (!cipher.notes) {
                                cipher.notes = '';
                            }
                            else if (cipher.notes !== '') {
                                cipher.notes += '\n';
                            }

                            cipher.notes += row[k];
                        }
                    }

                    // skip 1st row since its not data
                    for (var i = 1; i < results.data.length; i++) {
                        if (results.data[i].length < 3) {
                            continue;
                        }

                        var value = results.data[i],
                            category = value[results.data.length - 1],
                            notes = value[results.data.length - 2],
                            type = value[0];

                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = category && category !== '' && category !== 'Unfiled',
                            addFolder = hasFolder,
                            j = 0;

                        if (hasFolder) {
                            for (j = 0; j < folders.length; j++) {
                                if (folders[j].name === category) {
                                    addFolder = false;
                                    folderIndex = j;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: notes,
                            name: value[1] && value[1] !== '' ? value[1] : '--',
                            fields: null,
                            login: {
                                uri: null,
                                username: null,
                                password: null
                            }
                        };

                        if (type === 'Web Logins' || type === 'Servers' || type === 'Email Accounts') {
                            cipher.login.uri = value[4] && value[4] !== '' ? fixUri(value[4]) : null;
                            cipher.login.username = value[2] && value[2] !== '' ? value[2] : null;
                            cipher.login.password = value[3] && value[3] !== '' ? value[3] : null;
                            parseFieldsToNotes(5, value, cipher);
                        }
                        else if (value.length > 2) {
                            parseFieldsToNotes(2, value, cipher);
                        }

                        if (cipher.name && cipher.name !== '--' && type !== 'Web Logins' && type !== 'Servers' &&
                            type !== 'Email Accounts') {
                            cipher.name = type + ': ' + cipher.name;
                        }

                        if (cipher.notes === '') {
                            cipher.notes = null;
                        }

                        ciphers.push(cipher);

                        if (addFolder) {
                            folders.push({
                                name: category
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: cipherIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    }

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importMeldiumCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        var cipher = {
                            type: constants.cipherType.login,
                            name: row.DisplayName && row.DisplayName !== '' ? row.DisplayName : '--',
                            favorite: false,
                            notes: row.Notes && row.Notes !== '' ? row.Notes : null,
                            login: {
                                uri: row.Url && row.Url !== '' ? fixUri(row.Url) : null,
                                password: row.Password && row.Password !== '' ? row.Password : null,
                                username: row.UserName && row.UserName !== '' ? row.UserName : null
                            }
                        };

                        ciphers.push(cipher);
                    }

                    success(folders, ciphers, []);
                }
            });
        }

        function importPassKeepCsv(file, success, error) {
            function getValue(key, obj) {
                var val = obj[key] || obj[(' ' + key)];
                if (val && val !== '') {
                    return val;
                }

                return null;
            }

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        ciphers = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        var folderIndex = folders.length,
                            cipherIndex = ciphers.length,
                            hasFolder = !!getValue('category', value),
                            addFolder = hasFolder,
                            i = 0;

                        if (hasFolder) {
                            for (i = 0; i < folders.length; i++) {
                                if (folders[i].name === getValue('category', value)) {
                                    addFolder = false;
                                    folderIndex = i;
                                    break;
                                }
                            }
                        }

                        var cipher = {
                            type: constants.cipherType.login,
                            favorite: false,
                            notes: !!getValue('description', value) ? getValue('description', value) : null,
                            name: !!getValue('title', value) ? getValue('title', value) : '--',
                            login: {
                                uri: !!getValue('site', value) ? fixUri(getValue('site', value)) : null,
                                username: !!getValue('username', value) ? getValue('username', value) : null,
                                password: !!getValue('password', value) ? getValue('password', value) : null
                            }
                        };

                        if (!!getValue('password2', value)) {
                            if (!cipher.notes) {
                                cipher.notes = '';
                            }
                            else {
                                cipher.notes += '\n';
                            }

                            cipher.notes += ('Password 2: ' + getValue('password2', value));
                        }

                        ciphers.push(cipher);

                        if (addFolder) {
                            folders.push({
                                name: getValue('category', value)
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: cipherIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, ciphers, folderRelationships);
                }
            });
        }

        function importGnomeJson(file, success, error) {
            var folders = [],
                ciphers = [],
                folderRelationships = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                var folderIndex = 0;
                var cipherIndex = 0;

                if (fileJson && Object.keys(fileJson).length) {
                    for (var keyRing in fileJson) {
                        if (fileJson.hasOwnProperty(keyRing) && fileJson[keyRing].length) {
                            folderIndex = folders.length;
                            folders.push({
                                name: keyRing
                            });

                            for (i = 0; i < fileJson[keyRing].length; i++) {
                                var item = fileJson[keyRing][i];
                                if (!item.display_name || item.display_name.indexOf('http') !== 0) {
                                    continue;
                                }

                                cipherIndex = ciphers.length;

                                var cipher = {
                                    type: constants.cipherType.login,
                                    favorite: false,
                                    notes: '',
                                    name: item.display_name.replace('http://', '').replace('https://', ''),
                                    login: {
                                        uri: fixUri(item.display_name),
                                        username: item.attributes.username_value && item.attributes.username_value !== '' ?
                                            item.attributes.username_value : null,
                                        password: item.secret && item.secret !== '' ? item.secret : null
                                    }
                                };

                                if (cipher.name > 30) {
                                    cipher.name = cipher.name.substring(0, 30);
                                }

                                for (var attr in item.attributes) {
                                    if (item.attributes.hasOwnProperty(attr) && attr !== 'username_value' &&
                                        attr !== 'xdg:schema') {
                                        if (cipher.notes !== '') {
                                            cipher.notes += '\n';
                                        }
                                        cipher.notes += (attr + ': ' + item.attributes[attr]);
                                    }
                                }

                                if (cipher.notes === '') {
                                    cipher.notes = null;
                                }

                                ciphers.push(cipher);
                                folderRelationships.push({
                                    key: cipherIndex,
                                    value: folderIndex
                                });
                            }
                        }
                    }
                }

                success(folders, ciphers, folderRelationships);
            }
        }

        return _service;
    });
