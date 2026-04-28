import {
    ApolloClient,
    ApolloLink,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
    Observable,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';
import ReactDOM from 'react-dom';
import { App } from './App';
import './index.css';
import { getAccessToken, setAccessToken } from './utils/accessToken';

// Setup Apollo Client manually without Apollo Boost
// https://www.apollographql.com/docs/react/migrating/boost-migration/

const cache = new InMemoryCache({});

const requestLink = new ApolloLink(
    (operation, forward) =>
        new Observable((observer) => {
            let handle: any;
            Promise.resolve(operation)
                .then((operation) => {
                    const accessToken = getAccessToken();
                    operation.setContext({
                        headers: {
                            authorization: accessToken ? `Bearer ${accessToken}` : '',
                        },
                    });
                })
                .then(() => {
                    handle = forward(operation).subscribe({
                        next: observer.next.bind(observer),
                        error: observer.error.bind(observer),
                        complete: observer.complete.bind(observer),
                    });
                })
                .catch(observer.error.bind(observer));

            return () => {
                if (handle) handle.unsubscribe();
            };
        }),
);

const client = new ApolloClient({
    link: ApolloLink.from([
        new TokenRefreshLink({
            accessTokenField: 'accessToken',
            isTokenValidOrUndefined: () => {
                const token = getAccessToken();

                if (!token) {
                    return true;
                }

                try {
                    const { exp } = jwtDecode<{ exp: number }>(token);
                    if (Date.now() >= exp * 1000) {
                        return false;
                    } else {
                        return true;
                    }
                } catch {
                    return false;
                }
            },
            fetchAccessToken: () => {
                return fetch((process.env.REACT_APP_SERVER_URL as string) + '/refresh_token', {
                    method: 'POST',
                    credentials: 'include',
                });
            },
            handleFetch: (accessToken) => {
                setAccessToken(accessToken);
            },
            handleError: (err) => {
                console.warn('Your refresh token is invalid. Try to relogin');
                console.error(err);
            },
        }),
        onError(({ graphQLErrors, networkError }) => {
            console.log(graphQLErrors);
            console.log(networkError);
        }),
        requestLink,
        new HttpLink({
            uri: process.env.REACT_APP_SERVER_URL + '/graphql',
            credentials: 'include',
        }),
    ]),
    cache,
});

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root'),
);
