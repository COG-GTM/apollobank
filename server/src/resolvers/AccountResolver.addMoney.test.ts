import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { ErrorMessages, SuccessMessages } from "../utils/messages";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

describe("AccountResolver.addMoney", () => {
	const resolver = new AccountResolver();
	let update: jest.SpyInstance;

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(Object.assign(new User(), { id: 1 }));
		jest.spyOn(Account, "findOne").mockResolvedValue(
			Object.assign(new Account(), { id: 7, currency: "EUR", balance: 1000 })
		);
		update = jest.spyOn(Account, "update").mockResolvedValue({} as any);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("adds a positive amount to the account balance", async () => {
		// Act
		const result = await resolver.addMoney(250, 7, buildContext("1"));

		// Assert
		expect(Account.findOne).toHaveBeenCalledWith({
			where: { id: 7, owner: expect.objectContaining({ id: 1 }) },
		});
		expect(update).toHaveBeenCalledWith({ id: 7 }, { balance: 1250 });
		expect(result?.message).toBe(SuccessMessages.ADD_MONEY);
	});

	it.each([
		["negative", -500],
		["zero", 0],
		["NaN", NaN],
	])("rejects a %s amount without changing the balance", async (_label, amount) => {
		// Act
		const call = resolver.addMoney(amount, 7, buildContext("1"));

		// Assert
		await expect(call).rejects.toThrow(ErrorMessages.ADD_MONEY_AMOUNT);
		expect(update).not.toHaveBeenCalled();
	});

	it("returns null when the request carries no payload", async () => {
		// Act
		const result = await resolver.addMoney(250, 7, buildContext());

		// Assert
		expect(result).toBeNull();
		expect(update).not.toHaveBeenCalled();
	});
});
