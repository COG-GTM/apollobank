import { inject } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';
import { getAccessToken } from './access-token';
import { fetchRefreshToken, isTokenValidOrUndefined } from './refresh-token';

export const apolloOptionsFactory = () => {
    const httpLink = inject(HttpLink);

    const authLink = setContext(async () => {
        if (!isTokenValidOrUndefined()) {
            try {
                await fetchRefreshToken();
            } catch (err) {
                console.warn('Your refresh token is invalid. Try to relogin');
                console.error(err);
            }
        }
        const token = getAccessToken();
        return { headers: { authorization: token ? `Bearer ${token}` : '' } };
    });

    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) console.log(graphQLErrors);
        if (networkError) console.log(networkError);
    });

    return {
        link: ApolloLink.from([
            errorLink,
            authLink,
            httpLink.create({ uri: `${environment.serverUrl}/graphql`, withCredentials: true }),
        ]),
        cache: new InMemoryCache(),
    };
};
