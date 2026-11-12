# ApolloBank Angular client

Angular 19 port of the React 17 client in `../client`. It talks to the same GraphQL server (`../server`).

## Run

```bash
npm install
npm start          # http://localhost:3000 (the server's dev CORS origin)
```

The server must be running on `http://localhost:4000` (see the root README).

## Scripts

- `npm run build` – production build
- `npm run test:ci` – Karma/Jasmine unit tests in headless Chrome
- `npm run codegen` – regenerate `src/app/generated/graphql.ts` from `src/app/graphql/*.graphql` (server must be running)

## Structure

- `src/app/core` – access token store, refresh-token bootstrap, Apollo client, route guards, session (Me/logout)
- `src/app/layout` – toolbar, side drawer, backdrop, 404
- `src/app/shared` – theme constants and shared UI (title, loading, alert, dialog)
- `src/app/pages` – one standalone component per route
