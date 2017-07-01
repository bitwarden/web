angular
    .module('bit.services')

    .factory('cryptoService', function ($sessionStorage, constants, $q) {
        var _service = {},
            _key,
            _encKey,
            _legacyEtmKey,
            _orgKeys,
            _privateKey,
            _publicKey;

        _service.setKey = function (key) {
            _key = key;
            $sessionStorage.key = _key.keyB64;
        };

        _service.setEncKey = function (encKey, key, alreadyDecrypted) {
            if (alreadyDecrypted) {
                _encKey = encKey;
                $sessionStorage.encKey = _encKey.keyB64;
                return;
            }

            try {
                var encKeyBytes = _service.decrypt(encKey, key, 'raw');
                $sessionStorage.encKey = forge.util.encode64(encKeyBytes);
                _encKey = new SymmetricCryptoKey(encKeyBytes);
            }
            catch (e) {
                console.log('Cannot set enc key. Decryption failed.');
            }
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
                        var decBytes = _service.rsaDecrypt(orgKeysCt[orgId].key, privateKey);
                        var decKey = new SymmetricCryptoKey(decBytes);
                        _orgKeys[orgId] = decKey;
                        orgKeysb64[orgId] = decKey.keyB64;
                        setKey = true;
                    }
                    catch (e) {
                        console.log('Cannot set org key for ' + orgId + '. Decryption failed.');
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
                var decBytes = _service.rsaDecrypt(encOrgKey, privateKey);
                var decKey = new SymmetricCryptoKey(decBytes);
                _orgKeys[orgId] = decKey;
                orgKeysb64[orgId] = decKey.keyB64;
            }
            catch (e) {
                _orgKeys = null;
                console.log('Cannot set org key. Decryption failed.');
            }

            $sessionStorage.orgKeys = orgKeysb64;
        };

        _service.getKey = function () {
            if (!_key && $sessionStorage.key) {
                _key = new SymmetricCryptoKey($sessionStorage.key, true);
            }

            if (!_key) {
                throw 'key unavailable';
            }

            return _key;
        };

        _service.getEncKey = function () {
            if (!_encKey && $sessionStorage.encKey) {
                _encKey = new SymmetricCryptoKey($sessionStorage.encKey, true);
            }

            return _encKey;
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
                        orgKeys[orgId] = new SymmetricCryptoKey($sessionStorage.orgKeys[orgId], true);
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
            _legacyEtmKey = null;
            delete $sessionStorage.key;
        };

        _service.clearEncKey = function () {
            _encKey = null;
            delete $sessionStorage.encKey;
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
            _service.clearEncKey();
            _service.clearKeyPair();
            _service.clearOrgKeys();
        };

        _service.makeKey = function (password, salt) {
            var keyBytes = forge.pbkdf2(forge.util.encodeUtf8(password), forge.util.encodeUtf8(salt),
                5000, 256 / 8, 'sha256');
            return new SymmetricCryptoKey(keyBytes);
        };

        _service.makeEncKey = function (key) {
            var encKey = forge.random.getBytesSync(512 / 8);
            var encKeyEnc = _service.encrypt(encKey, key, 'raw');
            return {
                encKey: new SymmetricCryptoKey(encKey),
                encKeyEnc: encKeyEnc
            };
        };

        _service.makeKeyPair = function (key) {
            var deferred = $q.defer();

            forge.pki.rsa.generateKeyPair({
                bits: 2048,
                workers: 2,
                workerScript: '/lib/forge/prime.worker.min.js'
            }, function (error, keypair) {
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
            return _service.rsaEncryptMe(forge.random.getBytesSync(512 / 8));
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
            var encValue = aesEncrypt(plainValue, key, plainValueEncoding);

            var iv = forge.util.encode64(encValue.iv);
            var ct = forge.util.encode64(encValue.ct);
            var cipherString = iv + '|' + ct;

            if (encValue.mac) {
                var mac = forge.util.encode64(encValue.mac)
                cipherString = cipherString + '|' + mac;
            }

            return encValue.key.encType + '.' + cipherString;
        };

        _service.encryptToBytes = function (plainValue, key) {
            return aesEncryptWC(plainValue, key).then(function (encValue) {
                var macLen = 0;
                if (encValue.mac) {
                    macLen = encValue.mac.length
                }

                var encBytes = new Uint8Array(1 + encValue.iv.length + macLen + encValue.ct.length);

                encBytes.set([encValue.key.encType]);
                encBytes.set(encValue.iv, 1);
                if (encValue.mac) {
                    encBytes.set(encValue.mac, 1 + encValue.iv.length);
                }
                encBytes.set(encValue.ct, 1 + encValue.iv.length + macLen);

                return encBytes.buffer;
            });
        };

        function aesEncrypt(plainValue, key, plainValueEncoding) {
            key = key || _service.getEncKey() || _service.getKey();

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

            var ctBytes = cipher.output.getBytes();

            var macBytes = null;
            if (key.macKey) {
                macBytes = computeMac(ivBytes + ctBytes, key.macKey, false);
            }

            return {
                iv: ivBytes,
                ct: ctBytes,
                mac: macBytes,
                key: key,
                plainValueEncoding: plainValueEncoding
            };
        }

        function aesEncryptWC(plainValue, key) {
            key = key || _service.getEncKey() || _service.getKey();

            if (!key) {
                throw 'Encryption key unavailable.';
            }

            var obj = {
                iv: new Uint8Array(16),
                ct: null,
                mac: null,
                key: key
            };

            var keyBuf = key.getBuffers();
            window.crypto.getRandomValues(obj.iv);

            return window.crypto.subtle.importKey('raw', keyBuf.encKey, { name: 'AES-CBC' }, false, ['encrypt'])
                .then(function (encKey) {
                    return window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: obj.iv }, encKey, plainValue);
                }).then(function (encValue) {
                    obj.ct = new Uint8Array(encValue);
                    if (!keyBuf.macKey) {
                        return null;
                    }

                    var data = new Uint8Array(obj.iv.length + obj.ct.length);
                    data.set(obj.iv, 0);
                    data.set(obj.ct, obj.iv.length);
                    return computeMacWC(data.buffer, keyBuf.macKey);
                }).then(function (mac) {
                    if (mac) {
                        obj.mac = new Uint8Array(mac);
                    }
                    return obj;
                });
        }

        _service.rsaEncrypt = function (plainValue, publicKey, key) {
            publicKey = publicKey || _service.getPublicKey();
            if (!publicKey) {
                throw 'Public key unavailable.';
            }

            if (typeof publicKey === 'string') {
                var publicKeyBytes = forge.util.decode64(publicKey);
                publicKey = forge.pki.publicKeyFromAsn1(forge.asn1.fromDer(publicKeyBytes));
            }

            var encryptedBytes = publicKey.encrypt(plainValue, 'RSA-OAEP', {
                md: forge.md.sha1.create()
            });
            var cipherString = forge.util.encode64(encryptedBytes);

            if (key && key.macKey) {
                var mac = computeMac(encryptedBytes, key.macKey, true);
                return constants.encType.Rsa2048_OaepSha1_HmacSha256_B64 + '.' + cipherString + '|' + mac;
            }
            else {
                return constants.encType.Rsa2048_OaepSha1_B64 + '.' + cipherString;
            }
        };

        _service.rsaEncryptMe = function (plainValue) {
            return _service.rsaEncrypt(plainValue, _service.getPublicKey(), _service.getEncKey());
        };

        _service.decrypt = function (encValue, key, outputEncoding) {
            key = key || _service.getEncKey() || _service.getKey();

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
                encPieces = encValue.split('|');
                encType = encPieces.length === 3 ? constants.encType.AesCbc128_HmacSha256_B64 :
                    constants.encType.AesCbc256_B64;
            }

            if (encType === constants.encType.AesCbc128_HmacSha256_B64 && key.encType === constants.encType.AesCbc256_B64) {
                // Old encrypt-then-mac scheme, swap out the key
                _legacyEtmKey = _legacyEtmKey ||
                    new SymmetricCryptoKey(key.key, false, constants.encType.AesCbc128_HmacSha256_B64);
                key = _legacyEtmKey;
            }

            if (encType !== key.encType) {
                throw 'encType unavailable.';
            }

            switch (encType) {
                case constants.encType.AesCbc128_HmacSha256_B64:
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

            if (key.macKey && encPieces.length > 2) {
                var macBytes = forge.util.decode64(encPieces[2]);
                var computedMacBytes = computeMac(ivBytes + ctBytes, key.macKey, false);
                if (!macsEqual(key.macKey, macBytes, computedMacBytes)) {
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

        _service.decryptFromBytes = function (encBuf, key) {
            if (!encBuf) {
                throw 'no encBuf.';
            }

            var encBytes = new Uint8Array(encBuf),
                encType = encBytes[0],
                ctBytes = null,
                ivBytes = null,
                macBytes = null;

            switch (encType) {
                case constants.encType.AesCbc128_HmacSha256_B64:
                case constants.encType.AesCbc256_HmacSha256_B64:
                    if (encBytes.length <= 49) { // 1 + 16 + 32 + ctLength
                        return null;
                    }

                    ivBytes = encBytes.slice(1, 17);
                    macBytes = encBytes.slice(17, 49);
                    ctBytes = encBytes.slice(49);
                    break;
                case constants.encType.AesCbc256_B64:
                    if (encBytes.length <= 17) { // 1 + 16 + ctLength
                        return null;
                    }

                    ivBytes = encBytes.slice(1, 17);
                    ctBytes = encBytes.slice(17);
                    break;
                default:
                    return null;
            }

            return aesDecryptWC(
                encType,
                ctBytes.buffer,
                ivBytes.buffer,
                macBytes ? macBytes.buffer : null,
                key);
        };

        function aesDecryptWC(encType, ctBuf, ivBuf, macBuf, key) {
            key = key || _service.getEncKey() || _service.getKey();
            if (!key) {
                throw 'Encryption key unavailable.';
            }

            var keyBuf = key.getBuffers(),
                encKey = null;

            return window.crypto.subtle.importKey('raw', keyBuf.encKey, { name: 'AES-CBC' }, false, ['decrypt'])
                .then(function (theEncKey) {
                    encKey = theEncKey;

                    if (!key.macKey || !macBuf) {
                        return null;
                    }

                    var data = new Uint8Array(ivBuf.byteLength + ctBuf.byteLength);
                    data.set(new Uint8Array(ivBuf), 0);
                    data.set(new Uint8Array(ctBuf), ivBuf.byteLength);
                    return computeMacWC(data.buffer, keyBuf.macKey);
                }).then(function (computedMacBuf) {
                    if (computedMacBuf === null) {
                        return null;
                    }
                    return macsEqualWC(keyBuf.macKey, macBuf, computedMacBuf);
                }).then(function (macsMatch) {
                    if (macsMatch === false) {
                        console.error('MAC failed.');
                        return null;
                    }
                    return window.crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBuf }, encKey, ctBuf);
                });

        }

        _service.rsaDecrypt = function (encValue, privateKey, key) {
            privateKey = privateKey || _service.getPrivateKey();
            key = key || _service.getEncKey();

            if (!privateKey) {
                throw 'Private key unavailable.';
            }

            var headerPieces = encValue.split('.'),
                encType,
                encPieces;

            if (headerPieces.length === 1) {
                encType = constants.encType.Rsa2048_OaepSha256_B64;
                encPieces = [headerPieces[0]];
            }
            else if (headerPieces.length === 2) {
                try {
                    encType = parseInt(headerPieces[0]);
                    encPieces = headerPieces[1].split('|');
                }
                catch (e) {
                    return null;
                }
            }

            switch (encType) {
                case constants.encType.Rsa2048_OaepSha256_B64:
                case constants.encType.Rsa2048_OaepSha1_B64:
                    if (encPieces.length !== 1) {
                        return null;
                    }
                    break;
                case constants.encType.Rsa2048_OaepSha256_HmacSha256_B64:
                case constants.encType.Rsa2048_OaepSha1_HmacSha256_B64:
                    if (encPieces.length !== 2) {
                        return null;
                    }
                    break;
                default:
                    return null;
            }

            var ctBytes = forge.util.decode64(encPieces[0]);

            if (key && key.macKey && encPieces.length > 1) {
                var macBytes = forge.util.decode64(encPieces[1]);
                var computedMacBytes = computeMac(ctBytes, key.macKey, false);
                if (!macsEqual(key.macKey, macBytes, computedMacBytes)) {
                    console.error('MAC failed.');
                    return null;
                }
            }

            var md;
            if (encType === constants.encType.Rsa2048_OaepSha256_B64 ||
                encType === constants.encType.Rsa2048_OaepSha256_HmacSha256_B64) {
                md = forge.md.sha256.create();
            }
            else if (encType === constants.encType.Rsa2048_OaepSha1_B64 ||
                encType === constants.encType.Rsa2048_OaepSha1_HmacSha256_B64) {
                md = forge.md.sha1.create();
            }
            else {
                throw 'encType unavailable.';
            }

            var decBytes = privateKey.decrypt(ctBytes, 'RSA-OAEP', {
                md: md
            });

            return decBytes;
        };

        function computeMac(dataBytes, macKey, b64Output) {
            var hmac = forge.hmac.create();
            hmac.start('sha256', macKey);
            hmac.update(dataBytes);
            var mac = hmac.digest();
            return b64Output ? forge.util.encode64(mac.getBytes()) : mac.getBytes();
        }

        function computeMacWC(dataBuf, macKeyBuf) {
            return window.crypto.subtle.importKey('raw', macKeyBuf, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
                .then(function (key) {
                    return window.crypto.subtle.sign({ name: 'HMAC' }, key, dataBuf);
                });
        }

        // Safely compare two MACs in a way that protects against timing attacks (Double HMAC Verification).
        // ref: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2011/february/double-hmac-verification/
        function macsEqual(macKey, mac1, mac2) {
            var hmac = forge.hmac.create();

            hmac.start('sha256', macKey);
            hmac.update(mac1);
            mac1 = hmac.digest().getBytes();

            hmac.start(null, null);
            hmac.update(mac2);
            mac2 = hmac.digest().getBytes();

            return mac1 === mac2;
        }

        function macsEqualWC(macKeyBuf, mac1Buf, mac2Buf) {
            var mac1,
                macKey;

            return window.crypto.subtle.importKey('raw', macKeyBuf, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign'])
                .then(function (key) {
                    macKey = key;
                    return window.crypto.subtle.sign({ name: 'HMAC' }, macKey, mac1Buf);
                }).then(function (mac) {
                    mac1 = mac;
                    return window.crypto.subtle.sign({ name: 'HMAC' }, macKey, mac2Buf);
                }).then(function (mac2) {
                    if (mac1.byteLength !== mac2.byteLength) {
                        return false;
                    }

                    var arr1 = new Uint8Array(mac1);
                    var arr2 = new Uint8Array(mac2);

                    for (var i = 0; i < arr2.length; i++) {
                        if (arr1[i] !== arr2[i]) {
                            return false;
                        }
                    }

                    return true;
                });
        }

        function SymmetricCryptoKey(keyBytes, b64KeyBytes, encType) {
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
            var bufferLength = buffer.length();

            if (encType === null || encType === undefined) {
                if (bufferLength === 32) {
                    encType = constants.encType.AesCbc256_B64;
                }
                else if (bufferLength === 64) {
                    encType = constants.encType.AesCbc256_HmacSha256_B64;
                }
                else {
                    throw 'Unable to determine encType.';
                }
            }

            this.key = keyBytes;
            this.keyB64 = forge.util.encode64(keyBytes);
            this.encType = encType;

            if (encType === constants.encType.AesCbc256_B64 && bufferLength === 32) {
                this.encKey = keyBytes;
                this.macKey = null;
            }
            else if (encType === constants.encType.AesCbc128_HmacSha256_B64 && bufferLength === 32) {
                this.encKey = buffer.getBytes(16); // first half
                this.macKey = buffer.getBytes(16); // second half
            }
            else if (encType === constants.encType.AesCbc256_HmacSha256_B64 && bufferLength === 64) {
                this.encKey = buffer.getBytes(32); // first half
                this.macKey = buffer.getBytes(32); // second half
            }
            else {
                throw 'Unsupported encType/key length.';
            }
        }

        SymmetricCryptoKey.prototype.getBuffers = function () {
            if (this.keyBuf) {
                return this.keyBuf;
            }

            var key = b64ToArray(this.keyB64);

            var keys = {
                key: key.buffer
            };

            if (this.macKey) {
                keys.encKey = key.slice(0, key.length / 2).buffer;
                keys.macKey = key.slice(key.length / 2).buffer;
            }
            else {
                keys.encKey = key.buffer;
                keys.macKey = null;
            }

            this.keyBuf = keys;
            return this.keyBuf;
        };

        function b64ToArray(b64Str) {
            var binaryString = window.atob(b64Str);
            var arr = new Uint8Array(binaryString.length);
            for (var i = 0; i < binaryString.length; i++) {
                arr[i] = binaryString.charCodeAt(i);
            }
            return arr;
        }

        return _service;
    });