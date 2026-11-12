import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideApollo } from 'apollo-angular';
import { routes } from './app.routes';
import { apolloOptionsFactory } from './core/apollo.config';
import { fetchRefreshToken } from './core/refresh-token';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideAnimationsAsync(),
        provideApollo(apolloOptionsFactory),
        // Equivalent of React App.tsx: exchange the refresh-token cookie for an access token before routing.
        provideAppInitializer(() => fetchRefreshToken().catch(() => '')),
    ],
};
