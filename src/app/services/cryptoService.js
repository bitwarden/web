angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage, constants, $q) {
        var _service = {},
            _key,
            _orgKeys,
            _privateKey,
            _publicKey;

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = _key.keyB64;
        };

        _service.setPrivateKey = function (privateKeyCt, key) {
            try {
                var privateKeyBytes = _service.decrypt(privateKeyCt, key, 'raw');
                $sessionStorage.privateKey = forge.util.encode64(privateKeyBytes);
                _privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(privateKeyBytes));
            }
            catch (e) {
                console.log('Cannot set private key. Decryption failed.');
            }
        };

        _service.setOrgKeys = function (orgKeysCt, privateKey) {
            if (!orgKeysCt || Object.keys(orgKeysCt).length === 0) {
                return;
            }

            _service.clearOrgKeys();
            var orgKeysb64 = {},
                _orgKeys = {},
                setKey = false;

            for (var orgId in orgKeysCt) {
                if (orgKeysCt.hasOwnProperty(orgId)) {
                    try {
                        var orgKey = new CryptoKey(_service.rsaDecrypt(orgKeysCt[orgId].key, privateKey));
                        _orgKeys[orgId] = orgKey;
                        orgKeysb64[orgId] = orgKey.keyB64;
                        setKey = true;
                    }
                    catch (e) {
                        console.log('Cannot set org key ' + i + '. Decryption failed.');
                    }
                }
            }

            if (setKey) {
                $sessionStorage.orgKeys = orgKeysb64;
            }
            else {
                _orgKeys = null;
            }
        };

        _service.addOrgKey = function (orgId, encOrgKey, privateKey) {
            _orgKeys = _service.getOrgKeys();
            if (!_orgKeys) {
                _orgKeys = {};
            }

            var orgKeysb64 = $sessionStorage.orgKeys;
            if (!orgKeysb64) {
                orgKeysb64 = {};
            }

            try {
                var decOrgKey = new CryptoKey(_service.rsaDecrypt(encOrgKey, privateKey));
                _orgKeys[orgId] = decOrgKey;
                orgKeysb64[orgId] = decOrgKey.keyB64;
            }
            catch (e) {
                _orgKeys = null;
                console.log('Cannot set org key. Decryption failed.');
            }

            $sessionStorage.orgKeys = orgKeysb64;
        };

        _service.getKey = function () {
            if (!_key && $sessionStorage.key) {
                _key = new CryptoKey($sessionStorage.key, null, true);
            }

            if (!_key) {
                throw 'key unavailable';
            }

            return _key;
        };

        _service.getPrivateKey = function (outputEncoding) {
            outputEncoding = outputEncoding || 'native';

            if (_privateKey) {
                if (outputEncoding === 'raw') {
                    var privateKeyAsn1 = forge.pki.privateKeyToAsn1(_privateKey);
                    var privateKeyPkcs8 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
                    return forge.asn1.toDer(privateKeyPkcs8).getBytes();
                }

                return _privateKey;
            }

            if ($sessionStorage.privateKey) {
                var privateKeyBytes = forge.util.decode64($sessionStorage.privateKey);
                _privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(privateKeyBytes));

                if (outputEncoding === 'raw') {
                    return privateKeyBytes;
                }
            }

            return _privateKey;
        };

        _service.getPublicKey = function () {
            if (_publicKey) {
                return _publicKey;
            }

            var privateKey = _service.getPrivateKey();
            if (!privateKey) {
                return null;
            }

            _publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);
            return _publicKey;
        };

        _service.getOrgKeys = function () {
            if (_orgKeys) {
                return _orgKeys;
            }

            if ($sessionStorage.orgKeys) {
                var orgKeys = {},
                    setKey = false;

                for (var orgId in $sessionStorage.orgKeys) {
                    if ($sessionStorage.orgKeys.hasOwnProperty(orgId)) {
                        orgKeys[orgId] = new CryptoKey($sessionStorage.orgKeys[orgId], null, true);
                        setKey = true;
                    }
                }

                if (setKey) {
                    _orgKeys = orgKeys;
                }
            }

            return _orgKeys;
        };

        _service.getOrgKey = function (orgId) {
            var orgKeys = _service.getOrgKeys();
            if (!orgKeys || !(orgId in orgKeys)) {
                return null;
            }

            return orgKeys[orgId];
        };

        _service.clearKey = function () {
            _key = null;
            delete $sessionStorage.key;
        };

        _service.clearKeyPair = function () {
            _privateKey = null;
            _publicKey = null;
            delete $sessionStorage.privateKey;
        };

        _service.clearOrgKeys = function () {
            _orgKeys = null;
            delete $sessionStorage.orgKeys;
        };

        _service.clearOrgKey = function (orgId) {
            if (_orgKeys.hasOwnProperty(orgId)) {
                delete _orgKeys[orgId];
            }

            if ($sessionStorage.orgKeys.hasOwnProperty(orgId)) {
                delete $sessionStorage.orgKeys[orgId];
            }
        };

        _service.clearKeys = function () {
            _service.clearKey();
            _service.clearKeyPair();
            _service.clearOrgKeys();
        };

        _service.makeKey = function (password, salt) {
            var keyBytes = forge.pbkdf2(forge.util.encodeUtf8(password), forge.util.encodeUtf8(salt),
                5000, 256 / 8, 'sha256');
            return new CryptoKey(keyBytes);
        };

        _service.makeKeyPair = function (key) {
            var deferred = $q.defer();

            forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (error, keypair) {
                if (error) {
                    deferred.reject(error);
                    return;
                }

                var privateKeyAsn1 = forge.pki.privateKeyToAsn1(keypair.privateKey);
                var privateKeyPkcs8 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
                var privateKeyBytes = forge.asn1.toDer(privateKeyPkcs8).getBytes();
                var privateKeyEncCt = _service.encrypt(privateKeyBytes, key, 'raw');

                var publicKeyAsn1 = forge.pki.publicKeyToAsn1(keypair.publicKey);
                var publicKeyBytes = forge.asn1.toDer(publicKeyAsn1).getBytes();

                deferred.resolve({
                    publicKey: forge.util.encode64(publicKeyBytes),
                    privateKeyEnc: privateKeyEncCt
                });
            });

            return deferred.promise;
        };

        _service.makeShareKeyCt = function () {
            return _service.rsaEncrypt(forge.random.getBytesSync(512 / 8));
        };

        _service.hashPassword = function (password, key) {
            if (!key) {
                key = _service.getKey();
            }

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = forge.pbkdf2(key.key, forge.util.encodeUtf8(password), 1, 256 / 8, 'sha256');
            return forge.util.encode64(hashBits);
        };

        _service.encrypt = function (plainValue, key, plainValueEncoding) {
            key = key || _service.getKey();

            if (!key) {
                throw 'Encryption key unavailable.';
            }

            plainValueEncoding = plainValueEncoding || 'utf8';
            var buffer = forge.util.createBuffer(plainValue, plainValueEncoding);
            var ivBytes = forge.random.getBytesSync(16);
            var cipher = forge.cipher.createCipher('AES-CBC', key.encKey);
            cipher.start({ iv: ivBytes });
            cipher.update(buffer);
            cipher.finish();

            var iv = forge.util.encode64(ivBytes);
            var ctBytes = cipher.output.getBytes();
            var ct = forge.util.encode64(ctBytes);
            var cipherString = iv + '|' + ct;

            if (key.macKey) {
                var mac = computeMac(ctBytes, ivBytes, key.macKey);
                cipherString = cipherString + '|' + mac;
            }

            if (key.encType === constants.encType.AesCbc256_B64) {
                return cipherString;
            }

            return key.encType + '.' + cipherString;
        };

        _service.rsaEncrypt = function (plainValue, publicKey) {
            publicKey = publicKey || _service.getPublicKey();
            if (!publicKey) {
                throw 'Public key unavailable.';
            }

            if (typeof publicKey === 'string') {
                var publicKeyBytes = forge.util.decode64(publicKey);
                publicKey = forge.pki.publicKeyFromAsn1(forge.asn1.fromDer(publicKeyBytes));
            }

            var encryptedBytes = publicKey.encrypt(plainValue, 'RSA-OAEP', {
                md: forge.md.sha256.create()
            });

            return constants.encType.RsaOaep_Sha256_B64 + '.' + forge.util.encode64(encryptedBytes);
        };

        _service.decrypt = function (encValue, key, outputEncoding) {
            key = key || _service.getKey();

            var headerPieces = encValue.split('.'),
                encType,
                encPieces;

            if (headerPieces.length === 2) {
                try {
                    encType = parseInt(headerPieces[0]);
                    encPieces = headerPieces[1].split('|');
                }
                catch (e) {
                    return null;
                }
            }
            else {
                encType = constants.encType.AesCbc256_B64;
                encPieces = encValue.split('|');
            }

            if (encType !== key.encType) {
                throw 'encType unavailable.';
            }

            switch (encType) {
                case constants.encType.AesCbc128_HmacSha256_B64:
                    if (encPieces.length !== 3) {
                        return null;
                    }
                    break;
                case constants.encType.AesCbc256_HmacSha256_B64:
                    if (encPieces.length !== 3) {
                        return null;
                    }
                    break;
                case constants.encType.AesCbc256_B64:
                    if (encPieces.length !== 2) {
                        return null;
                    }
                    break;
                default:
                    return null;
            }

            var ivBytes = forge.util.decode64(encPieces[0]);
            var ctBytes = forge.util.decode64(encPieces[1]);

            if (key.macKey) {
                var computedMac = computeMac(ctBytes, ivBytes, key.macKey);
                if (computedMac !== encPieces[2]) {
                    console.error('MAC failed.');
                    return null;
                }
            }

            var ctBuffer = forge.util.createBuffer(ctBytes);
            var decipher = forge.cipher.createDecipher('AES-CBC', key.encKey);
            decipher.start({ iv: ivBytes });
            decipher.update(ctBuffer);
            decipher.finish();

            outputEncoding = outputEncoding || 'utf8';
            if (outputEncoding === 'utf8') {
                return decipher.output.toString('utf8');
            }
            else {
                return decipher.output.getBytes();
            }
        };

        _service.rsaDecrypt = function (encValue, privateKey) {
            privateKey = privateKey || _service.getPrivateKey();
            if (!privateKey) {
                throw 'Private key unavailable.';
            }

            var headerPieces = encValue.split('.'),
                encType,
                encPiece;

            if (headerPieces.length === 1) {
                encType = constants.encType.RsaOaep_Sha256_B64;
                encPiece = headerPieces[0];
            }
            else if (headerPieces.length === 2) {
                try {
                    encType = parseInt(headerPieces[0]);
                    encPiece = headerPieces[1];
                }
                catch (e) {
                    return null;
                }
            }

            if (encType !== constants.encType.RsaOaep_Sha256_B64) {
                return null;
            }

            var ctBytes = forge.util.decode64(encPiece);
            var decBytes = privateKey.decrypt(ctBytes, 'RSA-OAEP', {
                md: forge.md.sha256.create()
            });

            return decBytes;
        };

        function computeMac(ct, iv, macKey) {
            var hmac = forge.hmac.create();
            hmac.start('sha256', macKey);
            hmac.update(iv + ct);
            var mac = hmac.digest();
            return forge.util.encode64(mac.getBytes());
        }

        function CryptoKey(keyBytes, encType, b64KeyBytes) {
            if (b64KeyBytes) {
                keyBytes = forge.util.decode64(keyBytes);
            }

            if (!keyBytes) {
                throw 'Must provide keyBytes';
            }

            var buffer = forge.util.createBuffer(keyBytes);
            if (!buffer || buffer.length() === 0) {
                throw 'Couldn\'t make buffer';
            }

            if (encType === null || encType === undefined) {
                if (buffer.length() === 32) {
                    encType = constants.encType.AesCbc256_B64;
                }
                else if (buffer.length() === 64) {
                    encType = constants.encType.AesCbc256_HmacSha256_B64;
                }
                else {
                    throw 'Unable to determine encType.';
                }
            }

            this.key = keyBytes;
            this.keyB64 = forge.util.encode64(keyBytes);
            this.encType = encType;

            if (encType === constants.encType.AesCbc256_B64 && buffer.length() === 32) {
                this.encKey = keyBytes;
                this.macKey = null;
            }
            else if (encType === constants.encType.AesCbc128_HmacSha256_B64 && buffer.length() === 32) {
                this.encKey = buffer.getBytes(16); // first half
                this.macKey = buffer.getBytes(16); // second half
            }
            else if (encType === constants.encType.AesCbc256_HmacSha256_B64 && buffer.length() === 64) {
                this.encKey = buffer.getBytes(32); // first half
                this.macKey = buffer.getBytes(32); // second half
            }
            else {
                throw 'Unsupported key.';
            }
        };

        return _service;
    });