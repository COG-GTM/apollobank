# Backend Performance Audit

This document records a performance audit of the Apollobank GraphQL backend
(`apollo-server-express` + `type-graphql` + `TypeORM` + PostgreSQL, all under
`server/`). Each section describes one issue: what the problem is, the exact
file/symbol involved, why it costs latency, and the fix being applied by the
corresponding change.

A companion measurement script (`server/scripts/query-count.ts`, run via
`npm run query-count`) counts the SQL statements issued per GraphQL operation so
the before/after impact of these fixes can be observed. See
[How to verify](#how-to-verify).

> Note: `ormconfig.json` uses `"synchronize": true`, so schema changes coming
> from entity decorators (e.g. new `@Index` columns) are applied automatically
> on the next connection — no migration files are required.

---

## 1. Missing indexes on `@ManyToOne` foreign-key columns (biggest win)

**Files / symbols:**
- `src/entity/Account.ts` — `Account.owner` (`@ManyToOne(() => User, ...)`)
- `src/entity/Transaction.ts` — `Transaction.account` and `Transaction.card`
  (`@ManyToOne(() => Account, ...)` / `@ManyToOne(() => Card, ...)`)
- `src/entity/Card.ts` — `Card.owner` (`@ManyToOne(() => User, ...)`)

**Problem:** TypeORM generates a foreign-key column (e.g. `ownerId`,
`accountId`, `cardId`) for each `@ManyToOne` relation, but PostgreSQL does **not**
create an index on foreign-key columns automatically. None of these relations
declare an `@Index`, so no index exists on any FK column.

**Why it costs latency:** almost every read in the app filters by one of these
relations:
- `AccountResolver.accounts` / `account` → `Account.find({ where: { owner } })`
  filters on `accounts.ownerId`.
- `TransactionResolver.transactions` → `Transaction.find({ where: { account } })`
  filters on `transactions.accountId`.
- `CardResolver.cards` → `Card.find({ where: { account } })` filters on the
  card's owner/account relation.

Without an index, each of these becomes a **sequential scan** of the whole
table, and cost grows linearly with row count. On a table of any real size this
is the dominant source of query latency, and it compounds because these queries
run on nearly every dashboard load.

**Fix:** add `@Index()` to each `@ManyToOne` FK column so PostgreSQL can use a
B-tree index lookup instead of a full table scan. With `synchronize: true` the
indexes are created automatically on the next boot.

---

## 2. Redundant `User.findOne` on nearly every resolver call

**Files / symbols:**
- `AccountResolver.accounts`, `AccountResolver.account`, `AccountResolver.addMoney`,
  `AccountResolver.exchange`, `AccountResolver.createAccount`,
  `AccountResolver.deleteAccount`
- `TransactionResolver.transactions`, `TransactionResolver.createTransaction`
- `CardResolver.cards`, `CardResolver.createCard`
- `UserResolver.updatePassword`, `UserResolver.destroyAccount`

**Problem:** each of these resolvers starts with

```ts
const owner: User | undefined = await User.findOne({ where: { id: payload.userId } });
if (owner) {
    ... Account.find({ where: { owner: owner } });
}
```

The `payload.userId` value already comes from the verified JWT
(`MyContext.payload`, populated by the `isAuth` middleware), so the identity is
already known. The extra `User.findOne` re-fetches the entire user row purely to
obtain an object to hand to the next `where` clause.

**Why it costs latency:** it adds a second database round-trip to every
authenticated operation. For a query that only needs to read the user's
accounts, the request pays for two queries (user lookup + accounts lookup) where
one suffices. Round-trips dominate latency for small result sets, so this
roughly doubles the DB time of the cheapest, most frequent operations.

**Fix:** where a resolver only needs the user's id to filter a related entity,
drop the `User.findOne` and filter directly by the id from the JWT, e.g.

```ts
return Account.find({ where: { owner: { id: payload.userId } } });
```

This collapses two queries into one. (Resolvers that genuinely need the full
user row — e.g. `updatePassword`, which reads `owner.password` to compare — keep
the lookup.)

---

## 3. Extra round-trip query after writes

**Files / symbols:**
- `AccountResolver.addMoney`
- `TransactionResolver.createTransaction`

**Problem:** both mutations update an account and then issue a *second* query to
re-read the account they just wrote:

```ts
// addMoney
await Account.update({ id: account.id }, { balance: account.balance + amount });
...
const updatedAccount = await Account.findOne({ where: { owner, currency } }); // extra round-trip
```

```ts
// createTransaction
await Account.update({ id: account.id }, { balance: balance });
...
const updatedAccount = await Account.findOne({ where: { owner, currency } }); // extra round-trip
```

The new balance is already computed in memory before the `update`
(`account.balance + amount` / the local `balance` variable), so the follow-up
`findOne` fetches a value the code already has.

**Why it costs latency:** it adds an unnecessary `SELECT` (and in
`createTransaction`, another redundant `User.findOne` via issue #2's pattern)
after every money-changing operation, increasing both DB load and response time
on the write path.

**Fix:** build the response from the already-updated in-memory entity
(`account.balance = newBalance`) instead of re-querying, removing the trailing
`findOne`.

---

## 4. Un-awaited `Account.findOne` in `AccountResolver.account` (correctness)

**File / symbol:** `AccountResolver.account`

**Problem:** the `findOne` is missing an `await`:

```ts
const account = Account.findOne({ where: { owner: owner, currency: currency } });
if (account) {        // `account` is a Promise here — always truthy
    return account;
}
```

`Account.findOne(...)` returns a `Promise`, so `account` is a Promise object,
not the resolved row. `if (account)` is therefore **always true**, and the
`return account` returns the Promise (which type-graphql awaits), meaning the
"not found" branch (`return undefined`) is dead code.

**Why it matters:** this is a correctness bug found alongside the performance
work — the intended "account not found" handling never runs. The fix (`await`
the call) also makes the guard meaningful.

**Fix:** `await` the `findOne` so `account` is the resolved entity (or
`undefined`) before the truthiness check.

---

## 5. `"logging": true` on the `production` connection

**File:** `server/ormconfig.json` — the `production` connection object.

**Problem:** the `production` connection sets `"logging": true`, so TypeORM logs
**every** SQL statement it executes.

**Why it costs latency:** query logging in a hot path adds synchronous string
formatting and I/O (to stdout / the log pipeline) for every statement, inflates
log volume/cost, and can leak query contents. In production this is pure
overhead on every request.

**Fix:** set `"logging": false` on the `production` connection (matching the
`development` and `default` connections, which already disable it).

---

## 6. No connection-pool sizing in `createTypeOrmConnection.ts`

**File / symbol:** `src/utils/createTypeOrmConnection.ts` — `createTypeOrmConnection`.

**Problem:** the production connection is created without an `extra` block, so
the underlying `pg` pool falls back to library defaults (historically a max of
10 connections) with no explicit tuning of pool size or timeouts.

**Why it costs latency:** under concurrency, requests queue waiting for a free
connection once the small default pool is exhausted, adding tail latency; and
without an idle/connection timeout, stale or leaked connections are not reclaimed
predictably. Explicit sizing lets the pool be matched to the workload and the
database's `max_connections`.

**Fix:** pass an `extra` pool configuration (e.g. `max`, `idleTimeoutMillis`,
`connectionTimeoutMillis`) to the production `createConnection` call so pool
behaviour is deliberate rather than defaulted.

---

## How to verify

A dev-only measurement script lives at `server/scripts/query-count.ts` and is
wired as an npm script:

```bash
cd server
npm install
npm run query-count
```

The script opens a TypeORM connection with a custom logger that increments a
counter on every `logQuery`, runs a handful of representative operations
(fetch a user's accounts, fetch transactions for a currency account, fetch
cards), and prints the **number of SQL statements** and **elapsed milliseconds**
per operation. Comparing the counts before and after the fixes above shows the
reduction in queries per operation (issues #2 and #3) directly; the index and
pool changes (issues #1 and #6) show up primarily as reduced elapsed time on a
populated database.

If no PostgreSQL database is reachable, the script prints a clear message and
exits without throwing — a live database is not required to type-check it:

```bash
cd server
npx tsc --noEmit
```

This compiles the whole server (including the script) without running it, which
is the minimum bar this repository expects (a local PostgreSQL instance is
generally not available in CI or the dev sandbox).
