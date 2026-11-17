import faker from "faker";
import { TransactionResolver } from "./TransactionResolver";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

describe("TransactionResolver.createTransaction", () => {
	const resolver = new TransactionResolver();
	const owner = Object.assign(new User(), { id: 1 });
	const account = Object.assign(new Account(), { id: 2, currency: "USD", balance: 1000 });
	let findAccount: jest.SpyInstance;
	let insert: jest.SpyInstance;
	let update: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(owner);
		findAccount = jest.spyOn(Account, "findOne").mockResolvedValue(account);
		insert = jest.spyOn(Transaction, "insert").mockResolvedValue({} as any);
		update = jest.spyOn(Account, "update").mockResolvedValue({} as any);
		jest.spyOn(faker.finance, "transactionType").mockReturnValue("deposit");
		jest.spyOn(faker.finance, "amount").mockReturnValue("42");
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("adds the transaction to the account with the given id, scoped to the owner", async () => {
		// Act
		await resolver.createTransaction(2, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { id: 2, owner } });
		expect(insert).toHaveBeenCalledWith(expect.objectContaining({ account, amount: "42" }));
		expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 1042 });
	});

	it("changes nothing for an id that is not one of the owner's accounts", async () => {
		// Arrange
		findAccount.mockResolvedValue(undefined);

		// Act
		await resolver.createTransaction(99, buildContext("1"));

		// Assert
		expect(insert).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});
});
