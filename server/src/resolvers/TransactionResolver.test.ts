import { TransactionResolver } from "./TransactionResolver";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const owner = { id: 1 } as User;
const account = { id: 7, currency: "EUR" } as Account;
const context = { payload: { userId: "1" } } as unknown as MyContext;

describe("TransactionResolver.transactions", () => {
	let resolver: TransactionResolver;

	beforeEach(() => {
		resolver = new TransactionResolver();
		jest.spyOn(User, "findOne").mockResolvedValue(owner);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("queries the account's transactions by date descending, with id as a stable tie-breaker", async () => {
		// Arrange
		jest.spyOn(Account, "findOne").mockResolvedValue(account);
		const rows = [{ id: 2 }, { id: 1 }] as Transaction[];
		const find = jest.spyOn(Transaction, "find").mockResolvedValue(rows);

		// Act
		const result = await resolver.transactions("EUR", context);

		// Assert
		expect(find).toHaveBeenCalledWith({
			where: { account },
			order: { date: "DESC", id: "DESC" },
		});
		expect(result).toBe(rows);
	});

	it("returns an empty list for an account with no transactions", async () => {
		// Arrange
		jest.spyOn(Account, "findOne").mockResolvedValue(account);
		jest.spyOn(Transaction, "find").mockResolvedValue([]);

		// Act
		const result = await resolver.transactions("EUR", context);

		// Assert
		expect(result).toEqual([]);
	});

	it("returns null without querying transactions when the user has no account in the currency", async () => {
		// Arrange
		jest.spyOn(Account, "findOne").mockResolvedValue(undefined);
		const find = jest.spyOn(Transaction, "find");

		// Act
		const result = await resolver.transactions("USD", context);

		// Assert
		expect(result).toBeNull();
		expect(find).not.toHaveBeenCalled();
	});
});
