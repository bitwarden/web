import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { LockService } from 'jslib/abstractions/lock.service';
import { UserService } from 'jslib/abstractions/user.service';

@Injectable()
export class UnauthGuardService implements CanActivate {
    constructor(private lockService: LockService, private userService: UserService,
        private router: Router) { }

    async canActivate() {
        const isAuthed = await this.userService.isAuthenticated();
        if (isAuthed) {
            const locked = await this.lockService.isLocked();
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
