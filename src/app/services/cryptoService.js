angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage) {
        var _service = {},
            _key,
            _b64Key,
            _aes,
            _aesWithMac;

        sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = sjcl.codec.base64.fromBits(key);
        };

        _service.getKey = function (b64) {
            if (b64 && b64 === true && _b64Key) {
                return _b64Key;
            }
            else if (!b64 && _key) {
                return _key;
            }

            if ($sessionStorage.key) {
                _key = sjcl.codec.base64.toBits($sessionStorage.key);
            }

            if (b64 && b64 === true) {
                _b64Key = sjcl.codec.base64.fromBits(_key);
                return _b64Key;
            }

            return _key;
        };

        _service.getEncKey = function (key) {
            key = key || _service.getKey();
            return key.slice(0, 4);
        };

        _service.getMacKey = function (key) {
            key = key || _service.getKey();
            return key.slice(4);
        };

        _service.clearKey = function () {
            _key = _b64Key = _aes = _aesWithMac = null;
            delete $sessionStorage.key;
        };

        _service.makeKey = function (password, salt, b64) {
            var key = sjcl.misc.pbkdf2(password, salt, 5000, 256, null);

            if (b64 && b64 === true) {
                return sjcl.codec.base64.fromBits(key);
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

            var hashBits = sjcl.misc.pbkdf2(key, password, 1, 256, null);
            return sjcl.codec.base64.fromBits(hashBits);
        };

        _service.getAes = function () {
            if (!_aes && _service.getKey()) {
                _aes = new sjcl.cipher.aes(_service.getKey());
            }

            return _aes;
        };

        _service.getAesWithMac = function () {
            if (!_aesWithMac && _service.getKey()) {
                _aesWithMac = new sjcl.cipher.aes(_service.getEncKey());
            }

            return _aesWithMac;
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

            var response = {};
            var params = {
                mode: 'cbc',
                iv: sjcl.random.randomWords(4, 10)
            };

            var ctJson = sjcl.encrypt(encKey, plaintextValue, params, response);

            var ct = ctJson.match(/"ct":"([^"]*)"/)[1];
            var iv = sjcl.codec.base64.fromBits(response.iv);

            var cipherString = iv + '|' + ct;

            // TODO: Turn on whenever ready to support encrypt-then-mac
            if (false) {
                var mac = computeMac(ct, response.iv);
                cipherString = cipherString + '|' + mac;
            }

            return cipherString;
        };

        _service.decrypt = function (encValue) {
            if (!_service.getAes() || !_service.getAesWithMac()) {
                throw 'AES encryption unavailable.';
            }

            var encPieces = encValue.split('|');
            if (encPieces.length !== 2 && encPieces.length !== 3) {
                return '';
            }

            var ivBits = sjcl.codec.base64.toBits(encPieces[0]);
            var ctBits = sjcl.codec.base64.toBits(encPieces[1]);

            var computedMac = null;
            if (encPieces.length === 3) {
                computedMac = computeMac(ctBits, ivBits);
                if (computedMac !== encPieces[2]) {
                    console.error('MAC failed.');
                    return '';
                }
            }

            var decBits = sjcl.mode.cbc.decrypt(computedMac ? _service.getAesWithMac() : _service.getAes(), ctBits, ivBits, null);
            return sjcl.codec.utf8String.fromBits(decBits);
        };

        function computeMac(ct, iv) {
            if (typeof ct === 'string') {
                ct = sjcl.codec.base64.toBits(ct);
            }
            if (typeof iv === 'string') {
                iv = sjcl.codec.base64.toBits(iv);
            }

            var macKey = _service.getMacKey();
            var hmac = new sjcl.misc.hmac(macKey, sjcl.hash.sha256);
            var bits = iv.concat(ct);
            var mac = hmac.encrypt(bits);
            return sjcl.codec.base64.fromBits(mac);
        }

        return _service;
    });
