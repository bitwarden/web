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
                default:
                    error();
                    break;
            }
        };

        function importLocal(file, success, error) {
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    var folders = [],
                        sites = [],
                        folderRelationships = [];

                    angular.forEach(results.data, function (value, key) {
                        if (!value.uri || value.uri === '') {
                            return;
                        }

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
                            uri: value.uri,
                            username: value.username && value.username !== '' ? value.username : null,
                            password: value.password,
                            notes: value.notes && value.notes !== '' ? value.notes : null,
                            name: value.name
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
                    if (!value.url || value.url === '') {
                        return;
                    }

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
                        uri: value.url,
                        username: value.username && value.username !== '' ? value.username : null,
                        password: value.password,
                        notes: value.extra && value.extra !== '' ? value.extra : null,
                        name: value.name
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
                            uri: value.URL && value.URL !== '' ? value.URL : null,
                            username: value.Login && value.Login !== '' ? value.Login : null,
                            password: value.Password,
                            notes: value.Notes && value.Notes !== '' ? value.Notes : null,
                            name: value.Title
                        });
                    });

                    success(folders, sites, siteRelationships);
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
                            uri: '',
                            username: '',
                            password: '',
                            notes: '',
                            name: ''
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
                                    site.uri = value;
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

                        if (site.name === '') {
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

        return _service;
    });
