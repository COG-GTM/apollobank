/**
 * Dev-only SQL statement counter.
 *
 * Opens a TypeORM connection with a custom logger that increments a counter on
 * every executed query, runs a handful of representative read operations, and
 * prints the number of SQL statements and elapsed milliseconds per operation.
 *
 * This is a measurement aid for the backend performance work documented in
 * PERFORMANCE.md — run it before and after the fixes to compare query counts.
 *
 * Usage:  npm run query-count
 *
 * A live PostgreSQL database is required to actually run the operations. When
 * no database is reachable the script prints a clear message and exits cleanly
 * (exit code 0) rather than throwing, so it stays runnable in environments
 * without a database.
 */
import "reflect-metadata";
import "dotenv/config";
import {
	getConnectionOptions,
	createConnection,
	Connection,
	Logger,
	QueryRunner,
} from "typeorm";
import { User } from "../src/entity/User";
import { Account } from "../src/entity/Account";
import { Transaction } from "../src/entity/Transaction";
import { Card } from "../src/entity/Card";

/**
 * Minimal TypeORM logger that counts executed queries. Only `logQuery` is used
 * for counting; the remaining methods are no-ops to satisfy the interface.
 */
class CountingLogger implements Logger {
	public count: number = 0;

	logQuery(_query: string, _parameters?: any[], _queryRunner?: QueryRunner): void {
		this.count += 1;
	}

	logQueryError(): void {}
	logQuerySlow(): void {}
	logSchemaBuild(): void {}
	logMigration(): void {}
	log(): void {}

	reset(): void {
		this.count = 0;
	}
}

/**
 * Runs a single named operation, printing the SQL statement count and elapsed
 * milliseconds it produced.
 */
const measure = async (
	logger: CountingLogger,
	name: string,
	operation: () => Promise<unknown>
): Promise<void> => {
	logger.reset();
	const start = Date.now();
	await operation();
	const elapsed = Date.now() - start;
	console.log(`${name}: ${logger.count} quer${logger.count === 1 ? "y" : "ies"}, ${elapsed} ms`);
};

const main = async (): Promise<void> => {
	const logger = new CountingLogger();

	let connection: Connection;
	try {
		const connectionOptions = await getConnectionOptions(process.env.NODE_ENV);
		connection = await createConnection({
			...connectionOptions,
			name: "query-count",
			entities: [User, Account, Transaction, Card],
			logger,
			logging: true,
		} as any);
	} catch (err) {
		console.error(
			"query-count: could not connect to PostgreSQL — is a database running and configured?\n" +
				"This script needs a reachable database to run the operations; skipping.\n" +
				`Underlying error: ${err instanceof Error ? err.message : String(err)}`
		);
		process.exitCode = 0;
		return;
	}

	try {
		// Pick any existing user/account to drive representative reads. If the
		// database is empty there is nothing to measure, so say so and stop.
		const user: User | undefined = await User.findOne();

		if (!user) {
			console.log(
				"query-count: connected, but no users found. Seed the database (npm run seed) to measure operations."
			);
			return;
		}

		const account: Account | undefined = await Account.findOne({
			where: { owner: { id: user.id } },
		});

		console.log(`Measuring representative operations for user id=${user.id}:\n`);

		// 1. Fetch a user's accounts
		await measure(logger, "fetch user's accounts", () =>
			Account.find({ where: { owner: { id: user.id } } })
		);

		// 2. Fetch transactions for a currency account
		if (account) {
			await measure(logger, `fetch transactions (account id=${account.id})`, () =>
				Transaction.find({ where: { account: { id: account.id } } })
			);
		} else {
			console.log("fetch transactions: skipped (user has no accounts)");
		}

		// 3. Fetch cards
		await measure(logger, "fetch cards", () =>
			Card.find({ where: { owner: { id: user.id } } })
		);
	} finally {
		await connection.close();
	}
};

main().catch((err) => {
	console.error("query-count: unexpected error", err);
	process.exitCode = 1;
});
