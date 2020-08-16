import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserService } from 'jslib/abstractions/user.service';
import { VaultTimeoutService } from 'jslib/abstractions/vaultTimeout.service';

@Injectable()
export class UnauthGuardService implements CanActivate {
    constructor(
        private vaultTimeoutService: VaultTimeoutService,
        private userService: UserService,
        private router: Router
    ) {}

    async canActivate() {
        const isAuthed = await this.userService.isAuthenticated();
        if (isAuthed) {
            const locked = await this.vaultTimeoutService.isLocked();
            if (locked) {
                this.router.navigate(['lock']);
            } else {
                this.router.navigate(['vault']);
            }
            return false;
        }

        return true;
    }
}
