angular
    .module('bit.services')

    .factory('importService', function () {
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

        var _passwordFieldNames = [
            'password', 'pass word', 'passphrase', 'pass phrase',
            'pass', 'code', 'code word', 'codeword',
            'secret', 'secret word',
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
            'loginid', 'login id', 'log',
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
            'web-site',

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

        function importBitwardenCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        folderRelationships = [],
                        i = 0;

                    angular.forEach(results.data, function (value, key) {
                        var folderIndex = folders.length,
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: value.favorite && value.favorite !== '' && value.favorite !== '0' ? true : false,
                            uri: value.uri && value.uri !== '' ? trimUri(value.uri) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            totp: value.totp && value.totp !== '' ? value.totp : null
                        };

                        if (value.fields && value.fields !== '') {
                            var fields = value.fields.split('\n');
                            for (i = 0; i < fields.length; i++) {
                                if (!fields[i] || fields[i] === '') {
                                    continue;
                                }

                                var delimPosition = fields[i].lastIndexOf(': ');
                                if (delimPosition === -1) {
                                    continue;
                                }

                                if (!login.fields) {
                                    login.fields = [];
                                }

                                var field = {
                                    name: fields[i].substr(0, delimPosition),
                                    value: null,
                                    type: 0
                                };

                                if (fields[i].length > (delimPosition + 2)) {
                                    field.value = fields[i].substr(delimPosition + 2);
                                }

                                login.fields.push(field);
                            }
                        }

                        logins.push(login);

                        if (addFolder) {
                            folders.push({
                                name: value.folder
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: loginIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, logins, folderRelationships);
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
                        logins = [],
                        collectionRelationships = [],
                        i;

                    angular.forEach(results.data, function (value, key) {
                        var loginIndex = logins.length;

                        if (value.collections && value.collections !== '') {
                            var loginCollections = value.collections.split(',');

                            for (i = 0; i < loginCollections.length; i++) {
                                var addCollection = true;
                                var collectionIndex = collections.length;

                                for (var j = 0; j < collections.length; j++) {
                                    if (collections[j].name === loginCollections[i]) {
                                        addCollection = false;
                                        collectionIndex = j;
                                        break;
                                    }
                                }

                                if (addCollection) {
                                    collections.push({
                                        name: loginCollections[i]
                                    });
                                }

                                collectionRelationships.push({
                                    key: loginIndex,
                                    value: collectionIndex
                                });
                            }
                        }

                        var login = {
                            favorite: false,
                            uri: value.uri && value.uri !== '' ? trimUri(value.uri) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                            totp: value.totp && value.totp !== '' ? value.totp : null,
                        };

                        if (value.fields && value.fields !== '') {
                            var fields = value.fields.split('\n');
                            for (i = 0; i < fields.length; i++) {
                                if (!fields[i] || fields[i] === '') {
                                    continue;
                                }

                                var delimPosition = fields[i].lastIndexOf(': ');
                                if (delimPosition === -1) {
                                    continue;
                                }

                                if (!login.fields) {
                                    login.fields = [];
                                }

                                var field = {
                                    name: fields[i].substr(0, delimPosition),
                                    value: null,
                                    type: 0
                                };

                                if (fields[i].length > (delimPosition + 2)) {
                                    field.value = fields[i].substr(delimPosition + 2);
                                }

                                login.fields.push(field);
                            }
                        }

                        logins.push(login);
                    });

                    success(collections, logins, collectionRelationships);
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

            function parseData(data) {
                var folders = [],
                    logins = [],
                    loginRelationships = [];

                angular.forEach(data, function (value, key) {
                    var folderIndex = folders.length,
                        loginIndex = logins.length,
                        hasFolder = value.grouping && value.grouping !== '' && value.grouping !== '(none)',
                        addFolder = hasFolder;

                    if (hasFolder) {
                        for (var i = 0; i < folders.length; i++) {
                            if (folders[i].name === value.grouping) {
                                addFolder = false;
                                folderIndex = i;
                                break;
                            }
                        }
                    }

                    logins.push({
                        favorite: org ? false : value.fav === '1',
                        uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                        username: value.username && value.username !== '' ? value.username : null,
                        password: value.password && value.password !== '' ? value.password : null,
                        notes: value.extra && value.extra !== '' ? value.extra : null,
                        name: value.name && value.name !== '' ? value.name : '--',
                    });

                    if (addFolder) {
                        folders.push({
                            name: value.grouping
                        });
                    }

                    if (hasFolder) {
                        var relationship = {
                            key: loginIndex,
                            value: folderIndex
                        };
                        loginRelationships.push(relationship);
                    }
                });

                success(folders, logins, loginRelationships);
            }
        }

        function importSafeInCloudXml(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
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

                            var login = {
                                favorite: false,
                                uri: null,
                                username: null,
                                password: null,
                                notes: '',
                                name: card.attr('title'),
                            };

                            var fields = card.find('> field');
                            for (j = 0; j < fields.length; j++) {
                                var field = $(fields[j]);

                                var text = field.text();
                                var type = field.attr('type');
                                var name = field.attr('name');

                                if (text && text !== '') {
                                    if (type === 'login') {
                                        login.username = text;
                                    }
                                    else if (type === 'password') {
                                        login.password = text;
                                    }
                                    else if (type === 'notes') {
                                        login.notes += (text + '\n');
                                    }
                                    else if (type === 'weblogin' || type === 'website') {
                                        login.uri = trimUri(text);
                                    }
                                    else {
                                        login.notes += (name + ': ' + text + '\n');
                                    }
                                }
                            }

                            var notes = card.find('> notes');
                            for (j = 0; j < notes.length; j++) {
                                login.notes += ($(notes[j]).text() + '\n');
                            }

                            if (login.notes === '') {
                                login.notes = null;
                            }

                            logins.push(login);

                            labels = card.find('> label_id');
                            if (labels.length) {
                                var labelId = $(labels[0]).text();
                                var folderIndex = foldersIndex[labelId];
                                if (labelId !== null && labelId !== '' && folderIndex !== null) {
                                    loginRelationships.push({
                                        key: logins.length - 1,
                                        value: folderIndex
                                    });
                                }
                            }
                        }
                    }

                    success(folders, logins, loginRelationships);
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
                        logins = [],
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
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: false,
                            uri: null,
                            username: value[2] && value[2] !== '' ? value[2] : null,
                            password: value[3] && value[3] !== '' ? value[3] : null,
                            notes: null,
                            name: value[0] && value[0] !== '' ? value[0] : '--',
                        };

                        if (customFieldHeaders.length) {
                            for (j = 4; j < value.length; j++) {
                                var cf = value[j];
                                if (!cf || cf === '') {
                                    continue;
                                }

                                var cfHeader = customFieldHeaders[j - 4];
                                if (cfHeader.toLowerCase() === 'url' || cfHeader.toLowerCase() === 'uri') {
                                    login.uri = trimUri(cf);
                                }
                                else {
                                    if (login.notes === null) {
                                        login.notes = '';
                                    }

                                    login.notes += cfHeader + ': ' + cf + '\n';
                                }
                            }
                        }

                        logins.push(login);

                        if (addFolder) {
                            folders.push({
                                name: value[1]
                            });
                        }

                        if (hasFolder) {
                            folderRelationships.push({
                                key: loginIndex,
                                value: folderIndex
                            });
                        }
                    }

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function importKeePass2Xml(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [];

            getXmlFileContents(file, parse, error);

            function parse(xmlDoc) {
                var xml = $(xmlDoc);

                var root = xml.find('Root');
                if (root.length) {
                    var group = root.find('> Group');
                    if (group.length) {
                        traverse($(group[0]), true, '');
                        success(folders, logins, loginRelationships);
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
                        var loginIndex = logins.length;
                        var login = {
                            favorite: false,
                            uri: null,
                            username: null,
                            password: null,
                            notes: null,
                            name: null
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
                                    login.uri = trimUri(value);
                                    break;
                                case 'UserName':
                                    login.username = value;
                                    break;
                                case 'Password':
                                    login.password = value;
                                    break;
                                case 'Title':
                                    login.name = value;
                                    break;
                                case 'Notes':
                                    login.notes = login.notes === null ? value + '\n' : login.notes + value + '\n';
                                    break;
                                default:
                                    // other custom fields
                                    login.notes = login.notes === null ? key + ': ' + value + '\n'
                                        : login.notes + key + ': ' + value + '\n';
                                    break;
                            }
                        }

                        if (login.name === null) {
                            login.name = '--';
                        }

                        logins.push(login);

                        if (!isRootNode) {
                            loginRelationships.push({
                                key: loginIndex,
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
                        logins = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        value.Group = value.Group.startsWith('Root/') ?
                            value.Group.replace('Root/', '') : value.Group;

                        var groupName = value.Group && value.Group !== '' ?
                            value.Group.split('/').join(' > ') : null;

                        var folderIndex = folders.length,
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: false,
                            uri: value.URL && value.URL !== '' ? fixUri(value.URL) : null,
                            username: value.Username && value.Username !== '' ? value.Username : null,
                            password: value.Password && value.Password !== '' ? value.Password : null,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : null,
                            name: value.Title && value.Title !== '' ? value.Title : '--',
                        };

                        if (value.Title) {
                            logins.push(login);
                        }

                        if (addFolder) {
                            folders.push({
                                name: groupName
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: loginIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function import1Password1Pif(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
                i = 0;

            function parseFields(fields, login, designationKey, valueKey, nameKey) {
                for (var j = 0; j < fields.length; j++) {
                    var field = fields[j];
                    if (!field[valueKey] || field[valueKey] === '') {
                        continue;
                    }

                    if (!login.username && field[designationKey] && field[designationKey] === 'username') {
                        login.username = field[valueKey];
                    }
                    else if (!login.password && field[designationKey] && field[designationKey] === 'password') {
                        login.password = field[valueKey];
                    }
                    else if (!login.totp && field[designationKey] && field[designationKey].startsWith("TOTP_")) {
                        login.totp = field[valueKey];
                    }
                    else if (field[valueKey]) {
                        if (login.notes === null) {
                            login.notes = '';
                        }
                        else {
                            login.notes += '\n';
                        }

                        login.notes += ((field[nameKey] || 'no_name') + ': ' +
                            field[valueKey].toString().split('\\r\\n').join('\n').split('\\n').join('\n'));
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
                    var login = {
                        favorite: item.openContents && item.openContents.faveIndex ? true : false,
                        uri: item.location && item.location !== '' ? fixUri(item.location) : null,
                        username: null,
                        password: null,
                        notes: null,
                        name: item.title && item.title !== '' ? item.title : '--',
                        totp: null
                    };

                    if (item.secureContents) {
                        if (item.secureContents.notesPlain && item.secureContents.notesPlain !== '') {
                            login.notes = item.secureContents.notesPlain
                                .split('\\r\\n').join('\n').split('\\n').join('\n');
                        }

                        if (item.secureContents.fields) {
                            parseFields(item.secureContents.fields, login, 'designation', 'value', 'name');
                        }

                        if (item.secureContents.sections) {
                            for (var j = 0; j < item.secureContents.sections.length; j++) {
                                if (item.secureContents.sections[j].fields) {
                                    parseFields(item.secureContents.sections[j].fields, login, 'n', 'v', 't');
                                }
                            }
                        }
                    }

                    logins.push(login);
                }

                success(folders, logins, loginRelationships);
            }
        }

        function import1Password6WinCsv(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [];

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

                        var login = {
                            favorite: false,
                            uri: null,
                            username: null,
                            password: null,
                            notes: value.notesPlain && value.notesPlain !== '' ? value.notesPlain : '',
                            name: value.title && value.title !== '' ? value.title : '--'
                        };

                        for (var property in value) {
                            if (value.hasOwnProperty(property)) {
                                if (value[property] === null || value[property] === '') {
                                    continue;
                                }

                                if (!login.password && property === 'password') {
                                    login.password = value[property];
                                }
                                else if (!login.username && property === 'username') {
                                    login.username = value[property];
                                }
                                else if (!login.uri && property === 'urls') {
                                    var urls = value[property].split(/(?:\r\n|\r|\n)/);
                                    login.uri = fixUri(urls[0]);

                                    for (var j = 1; j < urls.length; j++) {
                                        if (login.notes !== '') {
                                            login.notes += '\n';
                                        }

                                        login.notes += ('url ' + (j + 1) + ': ' + urls[j]);
                                    }
                                }
                                else if (property !== 'ainfo' && property !== 'autosubmit' && property !== 'notesPlain' &&
                                    property !== 'ps' && property !== 'scope' && property !== 'tags' && property !== 'title' &&
                                    property !== 'uuid' && !property.startsWith('section:')) {

                                    if (login.notes !== '') {
                                        login.notes += '\n';
                                    }

                                    login.notes += (property + ': ' + value[property]);
                                }
                            }
                        }

                        if (login.notes === '') {
                            login.notes = null;
                        }

                        logins.push(login);
                    }

                    success(folders, logins, loginRelationships);
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
                        logins = [],
                        loginRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        logins.push({
                            favorite: false,
                            uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: null,
                            name: value.name && value.name !== '' ? value.name : '--',
                        });
                    });

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importFirefoxPasswordExporterCsvXml(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [];

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

                    logins.push({
                        favorite: false,
                        uri: host && host !== '' ? trimUri(host) : null,
                        username: user && user !== '' ? user : null,
                        password: password && password !== '' ? password : null,
                        notes: null,
                        name: getNameFromHost(host),
                    });
                }

                success(folders, logins, loginRelationships);
            }

            if (file.type && file.type === 'text/xml') {
                getXmlFileContents(file, parseXml, error);
            }
            else {
                // currently bugged due to the comment
                // ref: https://github.com/mholt/PapaParse/issues/351

                error('Only .xml exports are supported.');
                return;

                //Papa.parse(file, {
                //    comments: '#',
                //    header: true,
                //    encoding: 'UTF-8',
                //    complete: function (results) {
                //        parseCsvErrors(results);

                //        angular.forEach(results.data, function (value, key) {
                //            logins.push({
                //                favorite: false,
                //                uri: value.hostname && value.hostname !== '' ? trimUri(value.hostname) : null,
                //                username: value.username && value.username !== '' ? value.username : null,
                //                password: value.password && value.password !== '' ? value.password : null,
                //                notes: null,
                //                name: getNameFromHost(value.hostname),
                //            });
                //        });

                //        success(folders, logins, loginRelationships);
                //    }
                //});
            }
        }

        function importUpmCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        loginRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length === 5) {
                            logins.push({
                                favorite: false,
                                uri: value[3] && value[3] !== '' ? trimUri(value[3]) : null,
                                username: value[1] && value[1] !== '' ? value[1] : null,
                                password: value[2] && value[2] !== '' ? value[2] : null,
                                notes: value[4] && value[4] !== '' ? value[4] : null,
                                name: value[0] && value[0] !== '' ? value[0] : '--',
                            });
                        }
                    });

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importKeeperCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length >= 6) {
                            var folderIndex = folders.length,
                                loginIndex = logins.length,
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

                            var login = {
                                favorite: false,
                                uri: value[4] && value[4] !== '' ? trimUri(value[4]) : null,
                                username: value[2] && value[2] !== '' ? value[2] : null,
                                password: value[3] && value[3] !== '' ? value[3] : null,
                                notes: value[5] && value[5] !== '' ? value[5] : null,
                                name: value[1] && value[1] !== '' ? value[1] : '--',
                            };

                            if (value.length > 6) {
                                // we have some custom fields. add them to notes.

                                if (login.notes === null) {
                                    login.notes = '';
                                }
                                else {
                                    login.notes += '\n';
                                }

                                for (i = 6; i < value.length; i = i + 2) {
                                    var cfName = value[i];
                                    var cfValue = value[i + 1];
                                    login.notes += (cfName + ': ' + cfValue + '\n');
                                }
                            }

                            logins.push(login);

                            if (addFolder) {
                                folders.push({
                                    name: value[0]
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: loginIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    });

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function importPasswordDragonXml(file, success, error) {
            var folders = [],
                logins = [],
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
                                loginIndex = logins.length,
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

                            var login = {
                                favorite: false,
                                uri: url && url.text() !== '' ? trimUri(url.text()) : null,
                                username: userId && userId.text() !== '' ? userId.text() : null,
                                password: password && password.text() !== '' ? password.text() : null,
                                notes: notes && notes.text() !== '' ? notes.text() : null,
                                name: accountName && accountName.text() !== '' ? accountName.text() : '--',
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
                                // we have some attributes. add them to notes.
                                for (j = 0; j < attributes.length; j++) {
                                    var attr = $(attributes[j]),
                                        attrName = attr.prop('tagName'),
                                        attrValue = attr.text();

                                    if (!attrValue || attrValue === '' || attrValue === 'null') {
                                        continue;
                                    }

                                    if (login.notes === null) {
                                        login.notes = '';
                                    }
                                    else {
                                        login.notes += '\n';
                                    }

                                    login.notes += (attrName + ': ' + attrValue);
                                }
                            }

                            logins.push(login);

                            if (addFolder) {
                                folders.push({
                                    name: categoryText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: loginIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, logins, folderRelationships);
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
                        logins = [],
                        loginRelationships = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        if (row.length < 2) {
                            continue;
                        }
                        if (j === 0 && row[0] === 'Title') {
                            continue;
                        }

                        var note = row[row.length - 1];
                        var login = {
                            name: row[0],
                            favorite: false,
                            uri: null,
                            password: null,
                            username: null,
                            notes: note && note !== '' ? note : null,
                            totp: null
                        };

                        if (row.length > 2 && (row.length % 2) === 0) {
                            for (var i = 0; i < row.length - 2; i += 2) {
                                var value = row[i + 2];
                                if (!value || value === '') {
                                    continue;
                                }

                                var field = row[i + 1];
                                var fieldLower = field.toLowerCase();

                                if (fieldLower === 'url' && !login.uri) {
                                    login.uri = trimUri(value);
                                }
                                else if ((fieldLower === 'username' || fieldLower === 'email') && !login.username) {
                                    login.username = value;
                                }
                                else if (fieldLower === 'password' && !login.password) {
                                    login.password = value;
                                }
                                else if (fieldLower === 'totp' && !login.totp) {
                                    login.totp = value;
                                }
                                else {
                                    // other custom fields
                                    login.notes = login.notes === null ? field + ': ' + value
                                        : login.notes + '\n' + field + ': ' + value;
                                }
                            }
                        }

                        logins.push(login);
                    }

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importPasswordSafeXml(file, success, error) {
            var folders = [],
                logins = [],
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
                                loginIndex = logins.length,
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

                            var login = {
                                favorite: false,
                                uri: url && url.text() !== '' ? trimUri(url.text()) : null,
                                username: username && username.text() !== '' ? username.text() : null,
                                password: password && password.text() !== '' ? password.text() : null,
                                notes: notes && notesText !== '' ? notesText : null,
                                name: title && title.text() !== '' ? title.text() : '--',
                            };

                            if (!login.username && emailText && emailText !== '') {
                                login.username = emailText;
                            }
                            else if (emailText && emailText !== '') {
                                login.notes = login.notes === null ? 'Email: ' + emailText
                                    : login.notes + '\n' + 'Email: ' + emailText;
                            }

                            logins.push(login);

                            if (addFolder) {
                                folders.push({
                                    name: groupText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: loginIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, logins, folderRelationships);
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
                        logins = [],
                        loginRelationships = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var skip = false;
                        var row = results.data[j];
                        if (!row.length || row.length === 1) {
                            continue;
                        }

                        var login = {
                            name: row[0] && row[0] !== '' ? row[0] : '--',
                            favorite: false,
                            uri: null,
                            password: null,
                            username: null,
                            notes: null
                        };

                        if (row.length === 2) {
                            login.uri = fixUri(row[1]);
                        }
                        else if (row.length === 3) {
                            login.uri = fixUri(row[1]);
                            login.username = row[2];
                        }
                        else if (row.length === 4) {
                            if (row[2] === '' && row[3] === '') {
                                login.username = row[1];
                                login.notes = row[2] + '\n' + row[3];
                            }
                            else {
                                login.username = row[2];
                                login.notes = row[1] + '\n' + row[3];
                            }
                        }
                        else if (row.length === 5) {
                            login.uri = fixUri(row[1]);
                            login.username = row[2];
                            login.password = row[3];
                            login.notes = row[4];
                        }
                        else if (row.length === 6) {
                            if (row[2] === '') {
                                login.username = row[3];
                                login.password = row[4];
                                login.notes = row[5];
                            }
                            else {
                                login.username = row[2];
                                login.password = row[3];
                                login.notes = row[4] + '\n' + row[5];
                            }

                            login.uri = fixUri(row[1]);
                        }
                        else if (row.length === 7) {
                            if (row[2] === '') {
                                login.username = row[3];
                                login.notes = row[4] + '\n' + row[6];
                            }
                            else {
                                login.username = row[2];
                                login.notes = row[3] + '\n' + row[4] + '\n' + row[6];
                            }

                            login.uri = fixUri(row[1]);
                            login.password = row[5];
                        }
                        else {
                            login.notes = '';
                            for (var i = 1; i < row.length; i++) {
                                login.notes = login.notes + row[i] + '\n';
                                if (row[i] === 'NO_TYPE') {
                                    skip = true;
                                    break;
                                }
                            }
                        }

                        if (skip) {
                            continue;
                        }

                        if (login.username === '') {
                            login.username = null;
                        }
                        if (login.password === '') {
                            login.password = null;
                        }
                        if (login.notes === '') {
                            login.notes = null;
                        }
                        if (login.uri === '') {
                            login.uri = null;
                        }

                        logins.push(login);
                    }

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importStickyPasswordXml(file, success, error) {
            var folders = [],
                logins = [],
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
                                loginIndex = logins.length,
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

                            var login = {
                                favorite: false,
                                uri: linkText && linkText !== '' ? trimUri(linkText) : null,
                                username: usernameText && usernameText !== '' ? usernameText : null,
                                password: passwordText && passwordText !== '' ? passwordText : null,
                                notes: notesText && notesText !== '' ? notesText : null,
                                name: titleText && titleText !== '' ? titleText : '--',
                            };

                            logins.push(login);

                            if (addFolder) {
                                folders.push({
                                    name: groupText
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: loginIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    }

                    success(folders, logins, folderRelationships);
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
                        logins = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (value.length >= 3) {
                            var folderIndex = folders.length,
                                loginIndex = logins.length,
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

                            var login = {
                                favorite: false,
                                uri: null,
                                username: null,
                                password: null,
                                notes: '',
                                name: value[2] && value[2] !== '' ? value[2] : null
                            };

                            if (value[1] === 'Web Logins') {
                                login.uri = value[4] && value[4] !== '' ? trimUri(value[4]) : null;
                                login.username = value[5] && value[5] !== '' ? value[5] : null;
                                login.password = value[6] && value[6] !== '' ? value[6] : null;
                                login.notes = value[3] && value[3] !== '' ? value[3].split('\\n').join('\n') : null;
                            }
                            else if (value.length > 3) {
                                for (var j = 3; j < value.length; j++) {
                                    if (value[j] && value[j] !== '') {
                                        if (login.notes !== '') {
                                            login.notes = login.notes + '\n';
                                        }

                                        login.notes = login.notes + value[j];
                                    }
                                }
                            }

                            if (value[1] && value[1] !== '' && value[1] !== 'Web Logins') {
                                login.name = value[1] + ': ' + login.name;
                            }

                            if (login.notes === '') {
                                login.notes = null;
                            }

                            logins.push(login);

                            if (addFolder) {
                                folders.push({
                                    name: value[0]
                                });
                            }

                            if (hasFolder) {
                                var relationship = {
                                    key: loginIndex,
                                    value: folderIndex
                                };
                                folderRelationships.push(relationship);
                            }
                        }
                    });

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function importTrueKeyCsv(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
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
                        var login = {
                            favorite: value.favorite && value.favorite.toLowerCase() === 'true' ? true : false,
                            uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                            username: value.login && value.login !== '' ? value.login : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: value.memo && value.memo !== '' ? value.memo : null,
                            name: value.name && value.name !== '' ? value.name : '--'
                        };

                        if (value.kind !== 'login') {
                            login.name = value.title && value.title !== '' ? value.title : '--';
                            login.notes = value.note && value.note !== '' ? value.note : null;

                            if (!login.notes) {
                                login.notes = value.document_content && value.document_content !== '' ?
                                    value.document_content : null;
                            }

                            for (var property in value) {
                                if (value.hasOwnProperty(property) && propsToIgnore.indexOf(property.toLowerCase()) < 0 &&
                                    value[property] && value[property] !== '') {
                                    if (!login.notes) {
                                        login.notes = '';
                                    }
                                    else {
                                        login.notes += '\n';
                                    }

                                    // other custom fields
                                    login.notes += (property + ': ' + value[property]);
                                }
                            }
                        }

                        logins.push(login);
                    });

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importClipperzHtml(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [];

            getFileContents(file, parse, error);

            function parse(fileContents) {
                var doc = $(fileContents);
                var textarea = doc.find('textarea');
                var json = textarea && textarea.length ? textarea.val() : null;
                var entries = json ? JSON.parse(json) : null;

                if (entries && entries.length) {
                    for (var i = 0; i < entries.length; i++) {
                        var entry = entries[i];

                        var login = {
                            favorite: false,
                            uri: null,
                            username: null,
                            password: null,
                            notes: '',
                            name: entry.label && entry.label !== '' ? entry.label.split(' ')[0] : '--',
                        };

                        if (entry.data && entry.data.notes && entry.data.notes !== '') {
                            login.notes = entry.data.notes.split('\\n').join('\n');
                        }

                        if (entry.currentVersion && entry.currentVersion.fields) {
                            for (var property in entry.currentVersion.fields) {
                                if (entry.currentVersion.fields.hasOwnProperty(property)) {
                                    var field = entry.currentVersion.fields[property];
                                    var actionType = field.actionType.toLowerCase();

                                    switch (actionType) {
                                        case 'password':
                                            login.password = field.value;
                                            break;
                                        case 'email':
                                        case 'username':
                                        case 'user':
                                        case 'name':
                                            login.username = field.value;
                                            break;
                                        case 'url':
                                            login.uri = trimUri(field.value);
                                            break;
                                        default:
                                            if (!login.username && isField(field.label, _usernameFieldNames)) {
                                                login.username = field.value;
                                            }
                                            else if (!login.password && isField(field.label, _passwordFieldNames)) {
                                                login.password = field.value;
                                            }
                                            else {
                                                if (login.notes && login.notes !== '') {
                                                    login.notes = login.notes + '\n';
                                                }
                                                login.notes = login.notes + field.label + ': ' + field.value;
                                            }
                                            break;
                                    }
                                }
                            }
                        }

                        if (login.notes === '') {
                            login.notes = null;
                        }

                        logins.push(login);
                    }
                }

                success(folders, logins, loginRelationships);
            }
        }

        function importAviraJson(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                if (fileJson) {
                    if (fileJson.accounts) {
                        for (i = 0; i < fileJson.accounts.length; i++) {
                            var account = fileJson.accounts[i];
                            var login = {
                                favorite: account.is_favorite && account.is_favorite === true,
                                uri: account.domain && account.domain !== '' ? fixUri(account.domain) : null,
                                username: account.username && account.username !== '' ? account.username : null,
                                password: account.password && account.password !== '' ? account.password : null,
                                notes: null,
                                name: account.label && account.label !== '' ? account.label : account.domain,
                            };

                            if (account.email && account.email !== '') {
                                if (!login.username || login.username === '') {
                                    login.username = account.email;
                                }
                                else {
                                    login.notes = account.email;
                                }
                            }

                            if (!login.name || login.name === '') {
                                login.name = '--';
                            }

                            logins.push(login);
                        }
                    }
                }

                success(folders, logins, loginRelationships);
            }
        }

        function importRoboFormHtml(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [];

            getFileContents(file, parse, error);

            function parse(fileContents) {
                var doc = $(fileContents.split('&shy;').join('').split('<WBR>').join(''));
                var outterTables = doc.find('table.nobr');
                if (outterTables.length) {
                    for (var i = 0; i < outterTables.length; i++) {
                        var outterTable = $(outterTables[i]);
                        var login = {
                            favorite: false,
                            uri: null,
                            username: null,
                            password: null,
                            notes: '',
                            name: outterTable.find('span.caption').text()
                        };

                        var url = outterTable.find('.subcaption').text();
                        if (url && url !== '') {
                            login.uri = fixUri(url);
                        }

                        var fields = [];
                        $.each(outterTable.find('table td:not(.subcaption)'), function (indexInArray, valueOfElement) {
                            $(valueOfElement).find('br').replaceWith('\n');
                            var t = $(valueOfElement).text();
                            if (t !== '') {
                                fields.push(t.split('\\n').join('\n'));
                            }
                        });

                        if (fields.length && (fields.length % 2 === 0))
                            for (var j = 0; j < fields.length; j += 2) {
                                var field = fields[j];
                                var fieldValue = fields[j + 1];

                                if (!login.password && isField(field.replace(':', ''), _passwordFieldNames)) {
                                    login.password = fieldValue;
                                }
                                else if (!login.username && isField(field.replace(':', ''), _usernameFieldNames)) {
                                    login.username = fieldValue;
                                }
                                else {
                                    if (login.notes !== '') {
                                        login.notes = login.notes + '\n';
                                    }

                                    login.notes = login.notes + field + ' ' + fieldValue;
                                }
                            }

                        if (!login.notes || login.notes === '') {
                            login.notes = null;
                        }

                        if (!login.name || login.name === '') {
                            login.name = '--';
                        }

                        logins.push(login);
                    }
                }

                success(folders, logins, loginRelationships);
            }
        }

        function importSaferPassCsv(file, success, error) {
            function urlDomain(data) {
                var a = document.createElement('a');
                a.href = data;
                return a.hostname.startsWith('www.') ? a.hostname.replace('www.', '') : a.hostname;
            }

            var folders = [],
                logins = [],
                loginRelationships = [];

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    angular.forEach(results.data, function (value, key) {
                        logins.push({
                            favorite: false,
                            uri: value.url && value.url !== '' ? trimUri(value.url) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.url && value.url !== '' ? urlDomain(value.url) : '--',
                        });
                    });

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importAscendoCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        loginRelationships = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        if (row.length < 2) {
                            continue;
                        }

                        var note = row[row.length - 1];
                        var login = {
                            name: row[0],
                            favorite: false,
                            uri: null,
                            password: null,
                            username: null,
                            notes: note && note !== '' ? note : null
                        };

                        if (row.length > 2 && (row.length % 2) === 0) {
                            for (var i = 0; i < row.length - 2; i += 2) {
                                var value = row[i + 2];
                                var field = row[i + 1];
                                if (!field || field === '' || !value || value === '') {
                                    continue;
                                }

                                var fieldLower = field.toLowerCase();

                                if (!login.uri && isField(field, _uriFieldNames)) {
                                    login.uri = fixUri(value);
                                }
                                else if (!login.username && isField(field, _usernameFieldNames)) {
                                    login.username = value;
                                }
                                else if (!login.password && isField(field, _passwordFieldNames)) {
                                    login.password = value;
                                }
                                else {
                                    if (!login.notes) {
                                        login.notes = '';
                                    }
                                    else {
                                        login.notes += '\n';
                                    }

                                    // other custom fields
                                    login.notes += (field + ': ' + value);
                                }
                            }
                        }

                        logins.push(login);
                    }

                    success(folders, logins, loginRelationships);
                }
            });
        }

        function importPasswordBossJson(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                if (fileJson && fileJson.length) {
                    for (i = 0; i < fileJson.length; i++) {
                        var item = fileJson[i];

                        var login = {
                            favorite: false,
                            uri: item.login_url && item.login_url !== '' ? fixUri(item.login_url) : null,
                            username: null,
                            password: null,
                            notes: '',
                            name: item.name && item.name !== '' ? item.name : '--',
                        };

                        if (!item.identifiers) {
                            continue;
                        }

                        if (item.identifiers.notes && item.identifiers.notes !== '') {
                            login.notes = item.identifiers.notes.split('\\r\\n').join('\n').split('\\n').join('\n');
                        }

                        for (var property in item.identifiers) {
                            if (item.identifiers.hasOwnProperty(property)) {
                                var value = item.identifiers[property];
                                if (property === 'notes' || value === '' || value === null) {
                                    continue;
                                }

                                if (property === 'username') {
                                    login.username = value;
                                }
                                else if (property === 'password') {
                                    login.password = value;
                                }
                                else {
                                    if (login.notes !== '') {
                                        login.notes += '\n';
                                    }

                                    login.notes += (property + ': ' + value);
                                }
                            }
                        }

                        if (login.notes === '') {
                            login.notes = null;
                        }

                        logins.push(login);
                    }
                }

                success(folders, logins, loginRelationships);
            }
        }

        function importZohoVaultCsv(file, success, error) {
            function parseData(data, login) {
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
                        login.username = value;
                    }
                    else if (fieldLower === 'password') {
                        login.password = value;
                    }
                    else {
                        if (login.notes !== '') {
                            login.notes += '\n';
                        }

                        login.notes += (field + ': ' + value);
                    }
                }
            }

            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        var chamber = value.ChamberName;

                        var folderIndex = folders.length,
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: value.Favorite && value.Favorite === '1' ? true : false,
                            uri: value['Secret URL'] && value['Secret URL'] !== '' ? fixUri(value['Secret URL']) : null,
                            username: null,
                            password: null,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : '',
                            name: value['Secret Name'] && value['Secret Name'] !== '' ? value['Secret Name'] : '--'
                        };

                        parseData(value.SecretData, login);
                        parseData(value.CustomData, login);

                        if (login.notes === '') {
                            login.notes = null;
                        }

                        if (value['Secret Name']) {
                            logins.push(login);
                        }

                        if (addFolder) {
                            folders.push({
                                name: chamber
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: loginIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function importSplashIdCsv(file, success, error) {
            Papa.parse(file, {
                encoding: 'UTF-8',
                complete: function (results) {
                    parseCsvErrors(results);

                    var folders = [],
                        logins = [],
                        folderRelationships = [];

                    function parseFieldsToNotes(startIndex, row, login) {
                        // last 3 rows do not get parsed
                        for (var k = startIndex; k < row.length - 3; k++) {
                            if (!row[k] || row[k] === '') {
                                continue;
                            }

                            if (!login.notes) {
                                login.notes = '';
                            }
                            else if (login.notes !== '') {
                                login.notes += '\n';
                            }

                            login.notes += row[k];
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
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: false,
                            uri: null,
                            username: null,
                            password: null,
                            notes: notes,
                            name: value[1] && value[1] !== '' ? value[1] : '--'
                        };

                        if (type === 'Web Logins' || type === 'Servers' || type === 'Email Accounts') {
                            login.uri = value[4] && value[4] !== '' ? fixUri(value[4]) : null;
                            login.username = value[2] && value[2] !== '' ? value[2] : null;
                            login.password = value[3] && value[3] !== '' ? value[3] : null;
                            parseFieldsToNotes(5, value, login);
                        }
                        else if (value.length > 2) {
                            parseFieldsToNotes(2, value, login);
                        }

                        if (login.name && login.name !== '--' && type !== 'Web Logins' && type !== 'Servers' &&
                            type !== 'Email Accounts') {
                            login.name = type + ': ' + login.name;
                        }

                        if (login.notes === '') {
                            login.notes = null;
                        }

                        logins.push(login);

                        if (addFolder) {
                            folders.push({
                                name: category
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: loginIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    }

                    success(folders, logins, folderRelationships);
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
                        logins = [],
                        loginRelationships = [];

                    for (var j = 0; j < results.data.length; j++) {
                        var row = results.data[j];
                        var login = {
                            name: row.DisplayName && row.DisplayName !== '' ? row.DisplayName : '--',
                            favorite: false,
                            uri: row.Url && row.Url !== '' ? fixUri(row.Url) : null,
                            password: row.Password && row.Password !== '' ? row.Password : null,
                            username: row.UserName && row.UserName !== '' ? row.UserName : null,
                            notes: row.Notes && row.Notes !== '' ? row.Notes : null
                        };

                        logins.push(login);
                    }

                    success(folders, logins, loginRelationships);
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
                        logins = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        var folderIndex = folders.length,
                            loginIndex = logins.length,
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

                        var login = {
                            favorite: false,
                            uri: !!getValue('site', value) ? fixUri(getValue('site', value)) : null,
                            username: !!getValue('username', value) ? getValue('username', value) : null,
                            password: !!getValue('password', value) ? getValue('password', value) : null,
                            notes: !!getValue('description', value) ? getValue('description', value) : null,
                            name: !!getValue('title', value) ? getValue('title', value) : '--'
                        };

                        if (!!getValue('password2', value)) {
                            if (!login.notes) {
                                login.notes = '';
                            }
                            else {
                                login.notes += '\n';
                            }

                            login.notes += ('Password 2: ' + getValue('password2', value));
                        }

                        logins.push(login);

                        if (addFolder) {
                            folders.push({
                                name: getValue('category', value)
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: loginIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, logins, folderRelationships);
                }
            });
        }

        function importGnomeJson(file, success, error) {
            var folders = [],
                logins = [],
                loginRelationships = [],
                i = 0;

            getFileContents(file, parseJson, error);

            function parseJson(fileContent) {
                var fileJson = JSON.parse(fileContent);
                var folderIndex = 0;
                var loginIndex = 0;

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

                                loginIndex = logins.length;

                                var login = {
                                    favorite: false,
                                    uri: fixUri(item.display_name),
                                    username: item.attributes.username_value && item.attributes.username_value !== '' ?
                                        item.attributes.username_value : null,
                                    password: item.secret && item.secret !== '' ? item.secret : null,
                                    notes: '',
                                    name: item.display_name.replace('http://', '').replace('https://', ''),
                                };

                                if (login.name > 30) {
                                    login.name = login.name.substring(0, 30);
                                }

                                for (var attr in item.attributes) {
                                    if (item.attributes.hasOwnProperty(attr) && attr !== 'username_value' &&
                                        attr !== 'xdg:schema') {
                                        if (login.notes !== '') {
                                            login.notes += '\n';
                                        }
                                        login.notes += (attr + ': ' + item.attributes[attr]);
                                    }
                                }

                                if (login.notes === '') {
                                    login.notes = null;
                                }

                                logins.push(login);
                                loginRelationships.push({
                                    key: loginIndex,
                                    value: folderIndex
                                });
                            }
                        }
                    }
                }

                success(folders, logins, loginRelationships);
            }
        }

        return _service;
    });
