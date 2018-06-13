import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { CryptoService } from 'jslib/abstractions/crypto.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class UnauthGuardService implements CanActivate {
    constructor(private cryptoService: CryptoService, private userService: UserService,
        private router: Router) { }

    async canActivate() {
        const isAuthed = await this.userService.isAuthenticated();
        if (isAuthed) {
            const hasKey = await this.cryptoService.hasKey();
            if (!hasKey) {
                this.router.navigate(['lock']);
            } else {
                this.router.navigate(['vault']);
            }
            return false;
        }

        return true;
    }
}
