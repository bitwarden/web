angular
    .module('bit.services')

    .factory('importService', function () {
        var _service = {};

        _service.import = function (source, file, success, error) {
            switch (source) {
                case 'local':
                    importLocal(file, success, error);
                    break;
                case 'lastpass':
                    importLastPass(file, success, error);
                    break;
                case 'safeincloudcsv':
                    importSafeInCloudCsv(file, success, error);
                    break;
                case 'keypassxml':
                    importKeyPassXml(file, success, error);
                    break;
                case 'padlockcsv':
                    importPadlockCsv(file, success, error);
                    break;
                case '1password1pif':
                    import1Password1Pif(file, success, error);
                    break;
                default:
                    error();
                    break;
            }
        };

        function trimUri(uri) {
            if (uri.length > 2000) {
                return uri.substring(0, 2000);
            }

            return uri;
        }

        function importLocal(file, success, error) {
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    var folders = [],
                        sites = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        var folderIndex = folders.length,
                            siteIndex = sites.length,
                            hasFolder = value.folder && value.folder !== '',
                            addFolder = hasFolder;

                        if (hasFolder) {
                            for (var i = 0; i < folders.length; i++) {
                                if (folders[i].name === value.folder) {
                                    addFolder = false;
                                    folderIndex = i;
                                    break;
                                }
                            }
                        }

                        sites.push({
                            favorite: value.favorite !== null ? value.favorite : false,
                            uri: value.uri && value.uri !== '' ? trimUri(value.uri) : null,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password && value.password !== '' ? value.password : null,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name && value.name !== '' ? value.name : '--',
                        });

                        if (addFolder) {
                            folders.push({
                                name: value.folder
                            });
                        }

                        if (hasFolder) {
                            var relationship = {
                                key: siteIndex,
                                value: folderIndex
                            };
                            folderRelationships.push(relationship);
                        }
                    });

                    success(folders, sites, folderRelationships);
                }
            });
        }

        function importLastPass(file, success, error) {
            if (file.type === 'text/html') {
                var reader = new FileReader();
                reader.readAsText(file, 'utf-8');
                reader.onload = function (evt) {
                    var doc = $(evt.target.result);
                    var pre = doc.find('pre');
                    var csv, results;

                    if (pre.length === 1) {
                        csv = pre.text().trim();
                        results = Papa.parse(csv, { header: true });
                        parseData(results.data);
                    }
                    else {
                        var foundPre = false;
                        for (var i = 0; i < doc.length; i++) {
                            if (doc[i].tagName === 'PRE') {
                                foundPre = true;
                                csv = doc[i].outerText.trim();
                                results = Papa.parse(csv, { header: true });
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
                    complete: function (results) {
                        parseData(results.data);
                    }
                });
            }

            function parseData(data) {
                var folders = [],
                    sites = [],
                    siteRelationships = [];

                angular.forEach(data, function (value, key) {
                    var folderIndex = folders.length,
                        siteIndex = sites.length,
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

                    sites.push({
                        favorite: value.fav === '1',
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
                            key: siteIndex,
                            value: folderIndex
                        };
                        siteRelationships.push(relationship);
                    }
                });

                success(folders, sites, siteRelationships);
            }
        }

        function importSafeInCloudCsv(file, success, error) {
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    var folders = [],
                        sites = [],
                        siteRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        sites.push({
                            favorite: false,
                            uri: value.URL && value.URL !== '' ? trimUri(value.URL) : null,
                            username: value.Login && value.Login !== '' ? value.Login : null,
                            password: value.Password && value.Password !== '' ? value.Password : null,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : null,
                            name: value.Title && value.Title !== '' ? value.Title : '--',
                        });
                    });

                    success(folders, sites, siteRelationships);
                }
            });
        }

        function importPadlockCsv(file, success, error) {
            Papa.parse(file, {
                complete: function (results) {
                    var folders = [],
                        sites = [],
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
                            siteIndex = sites.length,
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

                        var site = {
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
                                    site.uri = trimUri(cf);
                                }
                                else {
                                    if (site.notes === null) {
                                        site.notes = '';
                                    }

                                    site.notes += cfHeader + ': ' + cf + '\n';
                                }
                            }
                        }

                        sites.push(site);

                        if (addFolder) {
                            folders.push({
                                name: value[1]
                            });
                        }

                        if (hasFolder) {
                            folderRelationships.push({
                                key: siteIndex,
                                value: folderIndex
                            });
                        }
                    }

                    success(folders, sites, folderRelationships);
                }
            });
        }

        function importKeyPassXml(file, success, error) {
            var folders = [],
                sites = [],
                siteRelationships = [];

            var reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = function (evt) {
                var xmlDoc = $.parseXML(evt.target.result),
                    xml = $(xmlDoc);

                var root = xml.find('Root');
                if (root.length) {
                    var group = root.find('> Group');
                    if (group.length) {
                        traverse($(group[0]), true, '');
                        success(folders, sites, siteRelationships);
                    }
                }
                else {
                    error();
                }
            };

            reader.onerror = function (evt) {
                error();
            };

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
                        var siteIndex = sites.length;
                        var site = {
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
                                    site.uri = trimUri(value);
                                    break;
                                case 'UserName':
                                    site.username = value;
                                    break;
                                case 'Password':
                                    site.password = value;
                                    break;
                                case 'Title':
                                    site.name = value;
                                    break;
                                case 'Notes':
                                    site.notes = site.notes === null ? value + '\n' : site.notes + value + '\n';
                                    break;
                                default:
                                    // other custom fields
                                    site.notes = site.notes === null ? key + ': ' + value + '\n'
                                        : site.notes + key + ': ' + value + '\n';
                                    break;
                            }
                        }

                        if (site.name === null) {
                            site.name = '--';
                        }

                        sites.push(site);

                        if (!isRootNode) {
                            siteRelationships.push({
                                key: siteIndex,
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

        function import1Password1Pif(file, success, error) {
            var folders = [],
                sites = [],
                siteRelationships = [];

            var i = 0,
                j = 0;

            var reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = function (evt) {
                var fileContent = evt.target.result;
                var jsonParts = fileContent.split(/(?:\r\n|\r|\n)\*\*\*.*?\*\*\*(?:\r\n|\r|\n)/);
                var jsonString = '[' + jsonParts.join(',') + ']';
                var items = JSON.parse(jsonString);

                for (i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.typeName !== 'webforms.WebForm') {
                        continue;
                    }

                    var site = {
                        favorite: item.openContents && item.openContents.faveIndex ? true : false,
                        uri: item.location && item.location !== '' ? trimUri(item.location) : null,
                        username: null,
                        password: null,
                        notes: null,
                        name: item.title && item.title !== '' ? item.title : '--',
                    };

                    if (item.secureContents) {
                        if (item.secureContents.notesPlain) {
                            site.notes = item.secureContents.notesPlain;
                        }

                        if (item.secureContents.fields) {
                            for (j = 0; j < item.secureContents.fields.length; j++) {
                                var field = item.secureContents.fields[j];
                                if (field.designation === 'username') {
                                    site.username = field.value;
                                }
                                else if (field.designation === 'password') {
                                    site.password = field.value;
                                }
                                else {
                                    if (site.notes === null) {
                                        site.notes = '';
                                    }
                                    else {
                                        site.notes += '\n';
                                    }

                                    site.notes += (field.name + ': ' + field.value + '\n');
                                }
                            }
                        }
                    }

                    sites.push(site);
                }

                success(folders, sites, siteRelationships);
            };

            reader.onerror = function (evt) {
                error();
            };
        }

        return _service;
    });
