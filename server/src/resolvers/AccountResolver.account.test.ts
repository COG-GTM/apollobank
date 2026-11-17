import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

describe("AccountResolver.account", () => {
	const resolver = new AccountResolver();
	const owner = Object.assign(new User(), { id: 1 });
	const secondUsdAccount = Object.assign(new Account(), { id: 2, currency: "USD", balance: 20506 });
	let findAccount: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(owner);
		findAccount = jest.spyOn(Account, "findOne").mockResolvedValue(secondUsdAccount);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("looks the account up by id, scoped to the signed-in owner", async () => {
		// Act
		const result = await resolver.account(2, buildContext("1"));

		// Assert
		expect(findAccount).toHaveBeenCalledWith({ where: { id: 2, owner } });
		expect(result).toBe(secondUsdAccount);
	});

	it("does not look the account up by currency, so two USD accounts stay distinct", async () => {
		// Act
		await resolver.account(1, buildContext("1"));

		// Assert
		const [{ where }] = findAccount.mock.calls[0];
		expect(where).not.toHaveProperty("currency");
		expect(where).toEqual({ id: 1, owner });
	});

	it("returns undefined for an id that is not one of the owner's accounts", async () => {
		// Arrange
		findAccount.mockResolvedValue(undefined);

		// Act
		const result = await resolver.account(99, buildContext("1"));

		// Assert
		expect(result).toBeUndefined();
	});

	it("throws when the request carries no payload", async () => {
		// Act
		const call = resolver.account(2, buildContext());

		// Assert
		await expect(call).rejects.toThrow();
		expect(findAccount).not.toHaveBeenCalled();
	});
});
