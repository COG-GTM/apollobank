import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs';
import { LogoutGQL, MeGQL } from '../generated/graphql';
import { setAccessToken } from './access-token';

/** Shared current-user state (React `useMeQuery`) and logout behaviour used by the toolbar and side drawer. */
@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly apollo = inject(Apollo);
    private readonly router = inject(Router);
    private readonly meGQL = inject(MeGQL);
    private readonly logoutGQL = inject(LogoutGQL);

    readonly me$ = this.meGQL.watch().valueChanges.pipe(map(({ data }) => data?.me ?? null));
    readonly isAuthenticated$ = this.me$.pipe(map((me) => !!me));

    async logout(): Promise<void> {
        await this.logoutGQL.mutate().toPromise();
        await this.router.navigateByUrl('/');
        setAccessToken('');
        await this.apollo.client.resetStore();
    }
}
