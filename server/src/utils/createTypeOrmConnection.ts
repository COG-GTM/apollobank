import { getConnectionOptions, createConnection, Connection, ConnectionOptions } from "typeorm";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { Transaction } from "../entity/Transaction";
import { Card } from "../entity/Card";

// Parse an integer from an env var, falling back to a default when the value is
// missing, non-numeric, or negative. Prevents a bad env value from silently
// producing a broken (e.g. NaN) pool configuration.
const envInt = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

// Explicit connection-pool sizing for the `pg` driver. Without these TypeORM
// falls back to the driver defaults (max 10, no explicit timeouts), which is
// easy to exhaust under load and gives no control over how long a request waits
// for a connection. Each setting is tunable per environment.
const poolExtra = {
	// Maximum number of clients the pool will hold open at once.
	max: envInt(process.env.DB_POOL_MAX, 20),
	// How long an idle client stays in the pool before being closed (ms).
	idleTimeoutMillis: envInt(process.env.DB_POOL_IDLE_TIMEOUT_MS, 30000),
	// How long to wait for a connection before failing the request (ms).
	connectionTimeoutMillis: envInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS, 5000)
};

export const createTypeOrmConnection = async (): Promise<Connection> => {
	const connectionOptions: ConnectionOptions = await getConnectionOptions(process.env.NODE_ENV);
	return process.env.NODE_ENV === "production"
		? createConnection({
				...connectionOptions,
				url: process.env.DATABASE_URL,
				entities: [User, Account, Transaction, Card],
				extra: { ...(connectionOptions as any).extra, ...poolExtra },
				name: "default"
		  } as any)
		: createConnection({
				...connectionOptions,
				extra: { ...(connectionOptions as any).extra, ...poolExtra },
				name: "default"
		  } as any);
};
