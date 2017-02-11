angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage) {
        var _service = {},
            _key,
            _b64Key;

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = forge.util.encode64(key);
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

        _service.clearKey = function () {
            _key = _b64Key = null;
            delete $sessionStorage.key;
        };

        _service.makeKey = function (password, salt, b64) {
            var key = forge.pbkdf2(password, salt, 5000, 256 / 8, 'sha256');

            if (b64 && b64 === true) {
                return forge.util.encode64(key);
            }

            return key;
        };

        _service.hashPassword = function (password, key) {
            if (!key) {
                key = _service.getKey();
            }

            if (!password || !key) {
                throw 'Invalid parameters.';
            }

            var hashBits = forge.pbkdf2(key, password, 1, 256 / 8, 'sha256');
            return forge.util.encode64(hashBits);
        };

        _service.encrypt = function (plaintextValue, key) {
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

            var buffer = forge.util.createBuffer(plaintextValue, 'utf8');
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

        _service.decrypt = function (encValue) {
            if (!_service.getKey()) {
                throw 'AES encryption unavailable.';
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

            var ctBuffer = forge.util.createBuffer(ctBytes);
            var decipher = forge.cipher.createDecipher('AES-CBC', computedMac ? _service.getEncKey() : _service.getKey());
            decipher.start({ iv: ivBytes });
            decipher.update(ctBuffer);
            decipher.finish();

            return decipher.output.toString('utf8');
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
