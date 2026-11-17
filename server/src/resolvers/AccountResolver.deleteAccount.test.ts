import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

describe("AccountResolver.deleteAccount", () => {
	const resolver = new AccountResolver();
	const owner = Object.assign(new User(), { id: 1 });
	let findAccount: jest.SpyInstance;
	let remove: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(owner);
		findAccount = jest
			.spyOn(Account, "findOne")
			.mockResolvedValue(Object.assign(new Account(), { id: 2, currency: "USD", balance: 0 }));
		remove = jest.spyOn(Account, "delete").mockResolvedValue({} as any);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("deletes the account with the given id, scoped to the owner", async () => {
		// Act
		const result = await resolver.deleteAccount(2, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { id: 2, owner } });
		expect(remove).toHaveBeenCalledWith({ id: 2 });
		expect(result).toBe(true);
	});

	it("deletes nothing for an id that is not one of the owner's accounts", async () => {
		// Arrange
		findAccount.mockResolvedValue(undefined);

		// Act
		await resolver.deleteAccount(99, buildContext("1"));

		// Assert
		expect(remove).not.toHaveBeenCalled();
	});
});
