import { Component } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    cipherType = CipherType;

    constructor(cipherService: CipherService) {
        super(cipherService);
    }

    checkCipher(c: CipherView) {
        (c as any).checked = !(c as any).checked;
    }
}
