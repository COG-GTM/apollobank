# Apollobank — Local Setup

Quick guide to run the stack locally on macOS.

## Prerequisites

- **Node.js 18.x** (tested on 18.20). If you're on a newer Node, the `--openssl-legacy-provider` flag (used below) keeps `react-scripts@4` working.
- **npm 8+**
- **PostgreSQL 14+** running on `localhost:5432`

```bash
node -v        # v18.x
psql --version # 14+
pg_isready     # accepting connections
```

If you don't have Postgres:

```bash
brew install postgresql@14
brew services start postgresql@14
```

## 1. Database

Create a `postgres` superuser and the `expressbank` database. Credentials are hardcoded in `server/ormconfig.json` (`postgres` / `postgres`).

```bash
# create role if missing
psql -d postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';" || true
# create db
createdb -O postgres expressbank
```

Verify:

```bash
psql -h localhost -U postgres -d expressbank -c "SELECT 1;"
```

TypeORM is configured with `synchronize: true`, so tables are created automatically on first server start.

## 2. Server

```bash
cd server
cp -n .env.example .env 2>/dev/null || true   # if you keep one; otherwise create .env manually:
cat > .env <<'EOF'
ACCESS_TOKEN_SECRET=apollobank-access-secret-local-dev
REFRESH_TOKEN_SECRET=apollobank-refresh-secret-local-dev
# Optional TypeORM/pg connection-pool tuning (safe defaults shown):
# DB_POOL_MAX=20                    # max pooled connections
# DB_POOL_IDLE_TIMEOUT_MS=30000     # close idle clients after this many ms
# DB_POOL_CONNECTION_TIMEOUT_MS=5000 # fail if no connection within this many ms
EOF

npm install
npm run dev
```

Server listens on `http://localhost:4000` (GraphQL at `/graphql`, playground enabled).

> **Note:** the `preinstall` hook runs `npx npm-force-resolutions`. It needs network access on first install.

## 3. Client

```bash
cd client
npm install

NODE_OPTIONS=--openssl-legacy-provider \
TSC_COMPILE_ON_ERROR=true \
ESLINT_NO_DEV_ERRORS=true \
npm start
```

App opens at `http://localhost:3000`.

### Why those env flags?

- `NODE_OPTIONS=--openssl-legacy-provider` — `react-scripts@4` uses Webpack 4, whose hashing breaks on Node 17+ OpenSSL.
- `TSC_COMPILE_ON_ERROR=true` + `ESLINT_NO_DEV_ERRORS=true` — the codebase has pre-existing TS errors (Apollo v2→v3 migration leftovers); these flags let the dev server serve while warnings are reported.

You can put these in `client/.env.development.local` to avoid prefixing every command:

```
TSC_COMPILE_ON_ERROR=true
ESLINT_NO_DEV_ERRORS=true
```

(`NODE_OPTIONS` must still be exported in the shell — CRA doesn't read it from `.env`.)

## 4. First-time use

1. Visit `http://localhost:3000`.
2. Click **Register** to create a user.
3. Log in → Dashboard.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page, console: `Cannot read properties of undefined (reading 'bind')` in `useQuery.ts` | Apollo v2/v3 client mismatch. Already fixed in `client/src/index.tsx` — make sure imports come from `@apollo/client`. |
| `error:0308010C:digital envelope routines::unsupported` | Add `NODE_OPTIONS=--openssl-legacy-provider` to the `npm start` command. |
| `ECONNREFUSED 127.0.0.1:5432` on server start | Postgres isn't running. `brew services start postgresql@14`. |
| `password authentication failed for user "postgres"` | Create the role: `psql -d postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';"`. |
| Dev server stuck on `Failed to compile` | TS errors are fatal without `TSC_COMPILE_ON_ERROR=true`. Re-export it and restart. |
| `npx npm-force-resolutions` hangs | Needs network. Or remove it from `server/package.json`'s `preinstall` if you don't need the `minimist` resolution. |

## Restart cheat-sheet

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && NODE_OPTIONS=--openssl-legacy-provider TSC_COMPILE_ON_ERROR=true ESLINT_NO_DEV_ERRORS=true npm start
```
