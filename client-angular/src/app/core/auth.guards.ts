import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getAccessToken } from './access-token';

/** Equivalent of React `AuthenticatedRoute`: requires an access token, otherwise /login. */
export const authGuard: CanActivateFn = () =>
    getAccessToken() ? true : inject(Router).createUrlTree(['/login']);

/** Equivalent of React `LoggedInRoute`: signed-in users are sent to /dashboard. */
export const loggedInGuard: CanActivateFn = () =>
    getAccessToken() ? inject(Router).createUrlTree(['/dashboard']) : true;
