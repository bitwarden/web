angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage) {
        var _service = {},
            _key,
            _b64Key,
            _privateKey,
            _publicKey,
            _orgKeys;

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = forge.util.encode64(key);
        };

        _service.setPrivateKey = function (privateKeyCt, key) {
            try {
                var privateKeyBytes = _service.decrypt(privateKeyCt, key, 'raw');
                $sessionStorage.privateKey = forge.util.encode64(privateKeyBytes);
                _privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(privateKeyBytes));;
            }
            catch (e) {
                console.log('Cannot set private key. Decryption failed.');
            }
        };

        _service.setOrgKeys = function (orgKeysCt, privateKey) {
            if (!orgKeysCt.length) {
                return;
            }

            var orgKeysb64 = {},
                _orgKeys = {},
                setKey = false;
            for (var i = 0; i < orgKeysCt.length; i++) {
                try {
                    var orgKey = _service.rsaDecrypt(orgKeysCt[i].key, privateKey);
                    _orgKeys[orgKeysCt[i].id] = orgKey;
                    orgKeysb64[orgKeysCt[i].id] = forge.util.encode64(orgKey);
                    setKey = true;
                }
                catch (e) {
                    console.log('Cannot set org key ' + i + '. Decryption failed.');
                }
            }

            if (setKey) {
                $sessionStorage.orgKeys = orgKeysb64;
            }
            else {
                _orgKeys = null;
            }
        };

        _service.addOrgKey = function (orgKeyCt, privateKey) {
            _orgKeys = _service.getOrgKeys();
            if (!_orgKeys) {
                _orgKeys = {};
            }

            var orgKeysb64 = $sessionStorage.orgKeys;
            if (!orgKeysb64) {
                orgKeysb64 = {};
            }

            try {
                var orgKey = _service.rsaDecrypt(orgKeyCt.key, privateKey);
                _orgKeys[orgKeyCt.id] = orgKey;
                orgKeysb64[orgKeyCt.id] = forge.util.encode64(orgKey);
            }
            catch (e) {
                _orgKeys = null;
                console.log('Cannot set org key. Decryption failed.');
            }

            $sessionStorage.orgKeys = orgKeysb64;
        };

        _service.getKey = function (b64) {
            if (b64 && b64 === true && _b64Key) {
                return _b64Key;
            }
            else if (!b64 && _key) {
                return _key;
            }

            if ($sessionStorage.key) {
                _key = forge.util.decode64($sessionStorage.key);
            }

            if (b64 && b64 === true) {
                _b64Key = forge.util.encode64(_key);
                return _b64Key;
            }

            return _key;
        };

        _service.getEncKey = function (key) {
            key = key || _service.getKey();

            var buffer = forge.util.createBuffer(key);
            return buffer.getBytes(16);
        };

        _service.getMacKey = function (key) {
            key = key || _service.getKey();

            var buffer = forge.util.createBuffer(key);
            buffer.getBytes(16); // skip first half
            return buffer.getBytes(16);
        };

        _service.getPrivateKey = function () {
            if (_privateKey) {
                return _privateKey;
            }

            if ($sessionStorage.privateKey) {
                var privateKeyBytes = forge.util.decode64($sessionStorage.privateKey);
                _privateKey = forge.pki.privateKeyFromAsn1(forge.asn1.fromDer(privateKeyBytes));
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
                        var orgKeyBytes = forge.util.decode64($sessionStorage.orgKeys[orgId]);
                        orgKeys[orgId] = orgKeyBytes;
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
        }

        _service.clearKey = function () {
            _key = _b64Key = null;
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

        _service.clearKeys = function () {
            _service.clearKey();
            _service.clearKeyPair();
            _service.clearOrgKeys();
        };

        _service.makeKey = function (password, salt, b64) {
            var key = forge.pbkdf2(forge.util.encodeUtf8(password), forge.util.encodeUtf8(salt),
                5000, 256 / 8, 'sha256');

            if (b64 && b64 === true) {
                return forge.util.encode64(key);
            }

            return key;
        };

        _service.makeKeyPair = function (key, callback) {
            forge.pki.rsa.generateKeyPair({ bits: 2048, workers: 2 }, function (error, keypair) {
                if (error) {
                    callback(null, null, error);
                    return;
                }

                var privateKeyAsn1 = forge.pki.privateKeyToAsn1(keypair.privateKey);
                var privateKeyPkcs8 = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
                var privateKeyBytes = forge.asn1.toDer(privateKeyPkcs8).getBytes();
                var privateKeyEncBytes = _service.encrypt(privateKeyBytes, key, 'raw');

                var publicKeyAsn1 = forge.pki.publicKeyToAsn1(keypair.publicKey);
                var publicKeyBytes = forge.asn1.toDer(publicKeyAsn1).getBytes();

                callback(forge.util.encode64(publicKeyBytes), privateKeyEncBytes, null);
            });
        };

        _service.makeShareKey = function () {
            return _service.rsaEncrypt(forge.random.getBytesSync(32));
        };

        _service.hashPassword = function (password, key) {
            if (!key) {
                key = _service.getKey();
            }

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = forge.pbkdf2(key, forge.util.encodeUtf8(password), 1, 256 / 8, 'sha256');
            return forge.util.encode64(hashBits);
        };

        _service.encrypt = function (plainValue, key, plainValueEncoding) {
            if (!_service.getKey() && !key) {
                throw 'Encryption key unavailable.';
            }

            // TODO: Turn on whenever ready to support encrypt-then-mac
            var encKey = null;
            if (false) {
                encKey = _service.getEncKey(key);
            }
            else {
                encKey = key || _service.getKey();
            }

            plainValueEncoding = plainValueEncoding || 'utf8';
            var buffer = forge.util.createBuffer(plainValue, plainValueEncoding);
            var ivBytes = forge.random.getBytesSync(16);
            var cipher = forge.cipher.createCipher('AES-CBC', encKey);
            cipher.start({ iv: ivBytes });
            cipher.update(buffer);
            cipher.finish();

            var iv = forge.util.encode64(ivBytes);
            var ctBytes = cipher.output.getBytes();
            var ct = forge.util.encode64(ctBytes);
            var cipherString = iv + '|' + ct;

            // TODO: Turn on whenever ready to support encrypt-then-mac
            if (false) {
                var mac = computeMac(ctBytes, ivBytes);
                cipherString = cipherString + '|' + mac;
            }

            return cipherString;
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
            return forge.util.encode64(encryptedBytes);
        };

        _service.decrypt = function (encValue, key, outputEncoding) {
            if (!_service.getKey() && !key) {
                throw 'Encryption key unavailable.';
            }

            var encPieces = encValue.split('|');
            if (encPieces.length !== 2 && encPieces.length !== 3) {
                return '';
            }

            var ivBytes = forge.util.decode64(encPieces[0]);
            var ctBytes = forge.util.decode64(encPieces[1]);

            var computedMac = null;
            if (encPieces.length === 3) {
                computedMac = computeMac(ctBytes, ivBytes);
                if (computedMac !== encPieces[2]) {
                    console.error('MAC failed.');
                    return '';
                }
            }

            var encKey;
            if (computedMac) {
                encKey = _service.getEncKey(key);
            }
            else {
                encKey = key || _service.getKey();
            }

            var ctBuffer = forge.util.createBuffer(ctBytes);
            var decipher = forge.cipher.createDecipher('AES-CBC', encKey);
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

            var ctBytes = forge.util.decode64(encValue);
            var decBytes = privateKey.decrypt(ctBytes, 'RSA-OAEP', {
                md: forge.md.sha256.create()
            });

            return decBytes;
        };

        function computeMac(ct, iv, macKey) {
            var hmac = forge.hmac.create();
            hmac.start('sha256', macKey || _service.getMacKey());
            hmac.update(iv + ct);
            var mac = hmac.digest();
            return forge.util.encode64(mac.getBytes());
        }

        return _service;
    });
