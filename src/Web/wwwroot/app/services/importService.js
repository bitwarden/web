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
                case 'safeincloud':
                    importSafeInCloud(file, success, error);
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
            Papa.parse(file, {
                header: true,
                complete: function (results) {
                    var folders = [],
                        sites = [],
                        siteRelationships = [];

                    angular.forEach(results.data, function (value, key) {
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
            });
        }

        function importSafeInCloud(file, success, error) {
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

        return _service;
    });
