import { TransactionResolver } from "./TransactionResolver";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

describe("TransactionResolver.transactions", () => {
	const resolver = new TransactionResolver();
	const owner = Object.assign(new User(), { id: 1 });
	const account = Object.assign(new Account(), { id: 2, currency: "USD", balance: 20506 });
	const accountTransactions = [Object.assign(new Transaction(), { id: 10, amount: "42" })];
	let findAccount: jest.SpyInstance;
	let findTransactions: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(owner);
		findAccount = jest.spyOn(Account, "findOne").mockResolvedValue(account);
		findTransactions = jest.spyOn(Transaction, "find").mockResolvedValue(accountTransactions);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("returns the transactions of the account with the given id, scoped to the owner", async () => {
		// Act
		const result = await resolver.transactions(undefined, 2, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { id: 2, owner } });
		expect(findTransactions).toHaveBeenCalledWith({ where: { account } });
		expect(result).toBe(accountTransactions);
	});

	it("prefers the id over the currency when both are given", async () => {
		// Act
		await resolver.transactions("USD", 2, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { id: 2, owner } });
	});

	it("still looks the account up by currency when no id is given", async () => {
		// Act
		await resolver.transactions("EUR", null, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { owner, currency: "EUR" } });
	});

	it("returns null for an id that is not one of the owner's accounts", async () => {
		// Arrange
		findAccount.mockResolvedValue(undefined);

		// Act
		const result = await resolver.transactions(undefined, 99, buildContext("1"));

		// Assert
		expect(result).toBeNull();
		expect(findTransactions).not.toHaveBeenCalled();
	});

	it.each([
		["no payload", buildContext(), 2],
		["neither an id nor a currency", buildContext("1"), undefined],
	])("returns null with %s", async (_label, context, id) => {
		// Act
		const result = await resolver.transactions(undefined, id, context);

		// Assert
		expect(result).toBeNull();
		expect(findAccount).not.toHaveBeenCalled();
	});
});
