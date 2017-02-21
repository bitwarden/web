angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage) {
        var _service = {},
            _key,
            _b64Key,
            _privateKey;

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = forge.util.encode64(key);
        };

        _service.setPrivateKey = function (privateKeyCt, key) {
            try {
                var privateKey = _service.decrypt(privateKeyCt, key, 'raw');
                _privateKey = privateKey;
                $sessionStorage.privateKey = forge.util.encode64(privateKey);
            }
            catch (e) {
                console.log('Cannot set private key. Decryption failed.');
            }
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
                _privateKey = forge.util.decode64($sessionStorage.privateKey);
            }

            return _privateKey;
        };

        _service.clearKey = function () {
            _key = _b64Key = null;
            delete $sessionStorage.key;
        };

        _service.clearPrivateKey = function () {
            _privateKey = null;
            delete $sessionStorage.privateKey;
        };

        _service.clearKeys = function () {
            _service.clearKey();
            _service.clearPrivateKey();
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

                var privateKey = forge.pki.privateKeyToAsn1(keypair.privateKey);
                var privateKeyBytes = forge.asn1.toDer(privateKey).getBytes();
                var privateKeyEnc = _service.encrypt(privateKeyBytes, key, 'raw');

                var publicKey = forge.pki.publicKeyToAsn1(keypair.publicKey);
                var publicKeyBytes = forge.asn1.toDer(publicKey).getBytes();

                callback(forge.util.encode64(publicKeyBytes), privateKeyEnc, null);
            });
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

        function computeMac(ct, iv, macKey) {
            var hmac = forge.hmac.create();
            hmac.start('sha256', macKey || _service.getMacKey());
            hmac.update(iv + ct);
            var mac = hmac.digest();
            return forge.util.encode64(mac.getBytes());
        }

        return _service;
    });
