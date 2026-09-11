import { getMetadataArgsStorage } from "typeorm";
import { User } from "./User";
import { Account } from "./Account";
import { Card } from "./Card";
import { Transaction } from "./Transaction";

const tableFor = (target: Function) =>
	getMetadataArgsStorage().tables.find((table) => table.target === target);

const columnNamesFor = (target: Function) =>
	getMetadataArgsStorage()
		.columns.filter((column) => column.target === target)
		.map((column) => column.propertyName);

const relationsFor = (target: Function) =>
	getMetadataArgsStorage().relations.filter((relation) => relation.target === target);

/**
 * Relations are declared with lazily evaluated type and inverse side functions, the same
 * way TypeORM evaluates them when it builds the entity metadata for a connection.
 */
const resolveRelations = (target: Function, owner: object) =>
	relationsFor(target).map((relation) => ({
		propertyName: relation.propertyName,
		type: (relation.type as () => Function)(),
		inverseSide: (relation.inverseSideProperty as (object: any) => any)(owner),
	}));

describe("User entity", () => {
	it("is mapped to the users table", () => {
		// Arrange & Act
		const table = tableFor(User);

		// Assert
		expect(table?.name).toBe("users");
	});

	it("exposes the profile and credential columns", () => {
		// Arrange & Act
		const columns = columnNamesFor(User);

		// Assert
		expect(columns).toEqual(
			expect.arrayContaining([
				"id",
				"email",
				"password",
				"firstName",
				"lastName",
				"dateOfBirth",
				"streetAddress",
				"postCode",
				"city",
				"country",
				"tokenVersion",
			])
		);
	});

	it("can hold account and card relations", () => {
		// Arrange
		const user = new User();

		// Act
		user.accounts = [new Account()];
		user.cards = [new Card()];

		// Assert
		expect(user.accounts).toHaveLength(1);
		expect(user.cards).toHaveLength(1);
	});

	it("declares one to many relations to accounts and cards", () => {
		// Arrange
		const user = new User();
		const owned = Object.assign(new Account(), { owner: user });

		// Act
		const relations = resolveRelations(User, owned);

		// Assert
		expect(relations).toEqual([
			{ propertyName: "accounts", type: Account, inverseSide: user },
			{ propertyName: "cards", type: Card, inverseSide: user },
		]);
	});
});

describe("Account entity", () => {
	it("is mapped to the accounts table", () => {
		// Arrange & Act
		const table = tableFor(Account);

		// Assert
		expect(table?.name).toBe("accounts");
	});

	it("defaults the balance to 1000 and the sort code to 00-00-00", () => {
		// Arrange & Act
		const columns = getMetadataArgsStorage().columns.filter((column) => column.target === Account);
		const balance = columns.find((column) => column.propertyName === "balance");
		const sortCode = columns.find((column) => column.propertyName === "sortCode");

		// Assert
		expect(balance?.options.default).toBe(1000);
		expect(sortCode?.options.default).toBe("00-00-00");
	});

	it("holds an owner and its transactions", () => {
		// Arrange
		const account = new Account();

		// Act
		account.owner = new User();
		account.transactions = [new Transaction()];

		// Assert
		expect(account.owner).toBeInstanceOf(User);
		expect(account.transactions).toHaveLength(1);
	});

	it("declares the owning user and the transactions written against it", () => {
		// Arrange
		const owner = Object.assign(new User(), { accounts: [] });

		// Act
		const relations = resolveRelations(Account, owner);

		// Assert
		expect(relations.map((relation) => relation.propertyName)).toEqual(["owner", "transactions"]);
		expect(relations.map((relation) => relation.type)).toEqual([User, Transaction]);
		expect(relations[0].inverseSide).toBe(owner.accounts);
	});
});

describe("Card entity", () => {
	it("is mapped to the cards table", () => {
		// Arrange & Act
		const table = tableFor(Card);

		// Assert
		expect(table?.name).toBe("cards");
	});

	it("exposes the card detail columns", () => {
		// Arrange & Act
		const columns = columnNamesFor(Card);

		// Assert
		expect(columns).toEqual(
			expect.arrayContaining(["cardNumber", "pin", "expiresIn", "cvv", "monthlySpendingLimit"])
		);
	});

	it("holds an owner and its transactions", () => {
		// Arrange
		const card = new Card();

		// Act
		card.owner = new User();
		card.transactions = [new Transaction()];

		// Assert
		expect(card.owner).toBeInstanceOf(User);
		expect(card.transactions).toHaveLength(1);
	});

	it("declares the owning user and the transactions made with it", () => {
		// Arrange
		const owner = Object.assign(new User(), { cards: [] });

		// Act
		const relations = resolveRelations(Card, owner);

		// Assert
		expect(relations.map((relation) => relation.propertyName)).toEqual(["owner", "transactions"]);
		expect(relations.map((relation) => relation.type)).toEqual([User, Transaction]);
		expect(relations[0].inverseSide).toBe(owner.cards);
	});
});

describe("Transaction entity", () => {
	it("is mapped to the transactions table", () => {
		// Arrange & Act
		const table = tableFor(Transaction);

		// Assert
		expect(table?.name).toBe("transactions");
	});

	it("requires the transaction date to be unique", () => {
		// Arrange & Act
		const date = getMetadataArgsStorage().columns.find(
			(column) => column.target === Transaction && column.propertyName === "date"
		);

		// Assert
		expect(date?.options.unique).toBe(true);
	});

	it("links to the account and card it belongs to", () => {
		// Arrange
		const transaction = new Transaction();

		// Act
		transaction.account = new Account();
		transaction.card = new Card();

		// Assert
		expect(transaction.account).toBeInstanceOf(Account);
		expect(transaction.card).toBeInstanceOf(Card);
	});

	it("declares the account and the card it is attached to", () => {
		// Arrange
		const holder = Object.assign(new Account(), { transactions: [] });

		// Act
		const relations = resolveRelations(Transaction, holder);

		// Assert
		expect(relations.map((relation) => relation.propertyName)).toEqual(["account", "card"]);
		expect(relations.map((relation) => relation.type)).toEqual([Account, Card]);
		expect(relations[0].inverseSide).toBe(holder.transactions);
	});
});
