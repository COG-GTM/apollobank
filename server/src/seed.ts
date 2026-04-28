import "reflect-metadata";
import "dotenv/config";
import { createConnection, getConnection } from "typeorm";
import { hash } from "bcryptjs";
import faker from "faker";
import { User } from "./entity/User";
import { Account } from "./entity/Account";
import { Card } from "./entity/Card";
import { Transaction } from "./entity/Transaction";

const NUM_USERS = 5;
const ACCOUNTS_PER_USER = 2;
const CARDS_PER_USER = 2;
const TRANSACTIONS_PER_ACCOUNT = 10;

const CURRENCIES = ["EUR", "USD", "GBP"];
const TRANSACTION_TYPES = ["deposit", "withdrawal", "transfer", "payment"];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomDigits = (length: number): string =>
	Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");

async function clearDatabase() {
	const conn = getConnection();
	// Order matters due to FK constraints
	await conn.query('TRUNCATE TABLE "transactions" RESTART IDENTITY CASCADE');
	await conn.query('TRUNCATE TABLE "cards" RESTART IDENTITY CASCADE');
	await conn.query('TRUNCATE TABLE "accounts" RESTART IDENTITY CASCADE');
	await conn.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
}

async function seed() {
	await createConnection();
	console.log("🌱 Seeding database...");

	await clearDatabase();

	// Deterministic demo user
	const demoPassword = await hash("password123", 12);
	const demoUser = await User.create({
		email: "demo@apollobank.com",
		password: demoPassword,
		firstName: "Demo",
		lastName: "User",
		dateOfBirth: "1990-01-01",
		streetAddress: "123 Demo Street",
		postCode: "00100",
		city: "Helsinki",
		country: "Finland",
	}).save();

	const users: User[] = [demoUser];

	for (let i = 0; i < NUM_USERS; i++) {
		const password = await hash("password123", 12);
		const user = await User.create({
			email: faker.internet.email().toLowerCase(),
			password,
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName(),
			dateOfBirth: faker.date.between("1960-01-01", "2002-01-01").toISOString().split("T")[0],
			streetAddress: faker.address.streetAddress(),
			postCode: faker.address.zipCode(),
			city: faker.address.city(),
			country: faker.address.country(),
		}).save();
		users.push(user);
	}

	let txDateCounter = Date.now();

	for (const user of users) {
		const accounts: Account[] = [];
		for (let a = 0; a < ACCOUNTS_PER_USER; a++) {
			const account = await Account.create({
				owner: user,
				sortCode: `${randomDigits(2)}-${randomDigits(2)}-${randomDigits(2)}`,
				iban: faker.finance.iban(),
				bic: faker.finance.bic(),
				currency: randomItem(CURRENCIES),
				balance: faker.random.number({ min: 500, max: 25000 }),
			}).save();
			accounts.push(account);
		}

		const cards: Card[] = [];
		for (let c = 0; c < CARDS_PER_USER; c++) {
			const card = await Card.create({
				owner: user,
				cardNumber: randomDigits(16),
				pin: faker.random.number({ min: 1000, max: 9999 }),
				expiresIn: faker.date.future(4),
				cvv: faker.random.number({ min: 100, max: 999 }),
				monthlySpendingLimit: faker.random.number({ min: 500, max: 5000 }),
			}).save();
			cards.push(card);
		}

		for (const account of accounts) {
			for (let t = 0; t < TRANSACTIONS_PER_ACCOUNT; t++) {
				await Transaction.create({
					account,
					card: randomItem(cards),
					transactionType: randomItem(TRANSACTION_TYPES),
					// Ensure unique date (column is unique)
					date: new Date(txDateCounter++),
					amount: faker.finance.amount(1, 1000, 2),
				}).save();
			}
		}
	}

	console.log(`✅ Seed complete: ${users.length} users, demo login → demo@apollobank.com / password123`);
	await getConnection().close();
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
