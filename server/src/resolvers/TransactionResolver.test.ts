import faker from "faker";
import { TransactionResolver } from "./TransactionResolver";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildUser = (id = 1): User => Object.assign(new User(), { id });

const buildAccount = (overrides: Partial<Account> = {}): Account =>
	Object.assign(new Account(), { id: 10, currency: "EUR", balance: 1000 }, overrides);

const buildContext = (userId?: string): MyContext =>
	({
		req: {},
		res: {},
		payload: userId === undefined ? undefined : { userId },
	} as MyContext);

describe("TransactionResolver", () => {
	const resolver = new TransactionResolver();
	let userFindOne: jest.SpyInstance;
	let accountFindOne: jest.SpyInstance;

	beforeEach(() => {
		userFindOne = jest.spyOn(User, "findOne").mockResolvedValue(buildUser());
		accountFindOne = jest.spyOn(Account, "findOne").mockResolvedValue(buildAccount());
		jest.spyOn(console, "log").mockImplementation(() => undefined);
		jest.spyOn(faker.finance, "amount").mockReturnValue("100");
		jest.spyOn(faker.date, "recent").mockReturnValue(new Date("2021-01-01T00:00:00.000Z"));
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("transactions", () => {
		it("returns the transactions of the account in the requested currency", async () => {
			// Arrange
			const transactions = [Object.assign(new Transaction(), { id: 1 })];
			const find = jest.spyOn(Transaction, "find").mockResolvedValue(transactions);

			// Act
			const result = await resolver.transactions("EUR", buildContext("1"));

			// Assert
			expect(find).toHaveBeenCalledWith({ where: { account: buildAccount() } });
			expect(result).toBe(transactions);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.transactions("EUR", context);

			// Assert
			expect(result).toBeNull();
			expect(userFindOne).not.toHaveBeenCalled();
		});

		it("returns null when the user owns no account in that currency", async () => {
			// Arrange
			accountFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.transactions("EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.transactions("EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("createTransaction", () => {
		it.each([
			["withdrawal", 900],
			["deposit", 1100],
			["payment", 900],
			["invoice", 900],
		])("applies a %s to the account balance", async (transactionType, expectedBalance) => {
			// Arrange
			jest.spyOn(faker.finance, "transactionType").mockReturnValue(transactionType);
			jest.spyOn(Transaction, "insert").mockResolvedValue({} as any);
			const update = jest.spyOn(Account, "update").mockResolvedValue({} as any);
			accountFindOne
				.mockResolvedValueOnce(buildAccount())
				.mockResolvedValueOnce(buildAccount({ balance: expectedBalance }));

			// Act
			const result = await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 10 }, { balance: expectedBalance });
			expect(result).toBe(expectedBalance);
		});

		it("leaves the balance untouched for an unrecognised transaction type", async () => {
			// Arrange
			jest.spyOn(faker.finance, "transactionType").mockReturnValue("transfer");
			jest.spyOn(Transaction, "insert").mockResolvedValue({} as any);
			const update = jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act
			await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 10 }, { balance: 1000 });
		});

		it("records the generated transaction against the account", async () => {
			// Arrange
			jest.spyOn(faker.finance, "transactionType").mockReturnValue("deposit");
			const insert = jest.spyOn(Transaction, "insert").mockResolvedValue({} as any);
			jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act
			await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(insert).toHaveBeenCalledWith({
				account: buildAccount(),
				transactionType: "deposit",
				date: new Date("2021-01-01T00:00:00.000Z"),
				amount: "100",
			});
		});

		it("throws when the account balance is zero", async () => {
			// Arrange
			accountFindOne.mockResolvedValue(buildAccount({ balance: 0 }));
			jest.spyOn(faker.finance, "transactionType").mockReturnValue("deposit");

			// Act & Assert
			await expect(resolver.createTransaction("EUR", buildContext("1"))).rejects.toThrow(
				"You do not have the sufficient funds."
			);
		});

		it("throws when the account balance is negative", async () => {
			// Arrange
			accountFindOne.mockResolvedValue(buildAccount({ balance: -5 }));
			jest.spyOn(faker.finance, "transactionType").mockReturnValue("deposit");

			// Act & Assert
			await expect(resolver.createTransaction("EUR", buildContext("1"))).rejects.toThrow(
				"You do not have the sufficient funds."
			);
		});

		it("returns null when persisting the transaction fails", async () => {
			// Arrange
			jest.spyOn(faker.finance, "transactionType").mockReturnValue("deposit");
			jest.spyOn(Transaction, "insert").mockRejectedValue(new Error("db down"));

			// Act
			const result = await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.createTransaction("EUR", context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns null when the user owns no account in that currency", async () => {
			// Arrange
			accountFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			accountFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.createTransaction("EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});
	});
});
