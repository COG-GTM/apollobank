import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { ErrorMessages, SuccessMessages } from "../utils/messages";

const buildContext = (userId?: string): MyContext =>
	({ req: {}, res: {}, payload: userId === undefined ? undefined : { userId } } as MyContext);

const buildAccount = (id: number, currency: string, balance: number): Account =>
	Object.assign(new Account(), { id, currency, balance });

describe("AccountResolver", () => {
	const resolver = new AccountResolver();
	let update: jest.SpyInstance;

	const givenAccounts = (from: Account, to: Account | undefined) => {
		jest.spyOn(Account, "findOne")
			.mockResolvedValueOnce(from)
			.mockResolvedValueOnce(to)
			.mockResolvedValueOnce(from);
	};

	beforeEach(() => {
		jest.spyOn(User, "findOne").mockResolvedValue(Object.assign(new User(), { id: 1 }));
		update = jest.spyOn(Account, "update").mockResolvedValue({} as any);
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("exchange", () => {
		it.each([
			["EUR", "USD", 111],
			["EUR", "GBP", 89],
			["USD", "EUR", 90],
			["USD", "GBP", 80],
			["GBP", "USD", 125],
			["GBP", "EUR", 113],
		])(
			"debits 100 %s from the source and credits the converted amount in %s",
			async (from, to, converted) => {
				// Arrange
				givenAccounts(buildAccount(1, from, 1000), buildAccount(2, to, 500));

				// Act
				const result = await resolver.exchange(1, 2, 100, buildContext("1"));

				// Assert
				expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 900 });
				expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 500 + converted });
				expect(result?.message).toBe(SuccessMessages.EXCHANGE);
			}
		);

		it("loads the source and target accounts by id, scoped to the owner", async () => {
			// Arrange
			givenAccounts(buildAccount(1, "USD", 1000), buildAccount(3, "EUR", 500));

			// Act
			await resolver.exchange(1, 3, 100, buildContext("1"));

			// Assert
			const owner = expect.objectContaining({ id: 1 });
			expect(Account.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1, owner } });
			expect(Account.findOne).toHaveBeenNthCalledWith(2, { where: { id: 3, owner } });
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 900 });
			expect(update).toHaveBeenCalledWith({ id: 3 }, { balance: 590 });
		});

		it("allows exchanging the whole balance even when the converted amount is larger", async () => {
			// Arrange
			givenAccounts(buildAccount(1, "EUR", 100), buildAccount(2, "USD", 0));

			// Act
			await resolver.exchange(1, 2, 100, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 0 });
			expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 111 });
		});

		it("rejects an amount larger than the source balance", async () => {
			// Arrange
			givenAccounts(buildAccount(1, "EUR", 50), buildAccount(2, "USD", 0));

			// Act
			const call = resolver.exchange(1, 2, 100, buildContext("1"));

			// Assert
			await expect(call).rejects.toThrow(ErrorMessages.EXCHANGE);
			expect(update).not.toHaveBeenCalled();
		});

		it("rejects a currency pair without a conversion rate instead of debiting the source", async () => {
			// Arrange
			givenAccounts(buildAccount(1, "USD", 1000), buildAccount(2, "USD", 500));

			// Act
			const call = resolver.exchange(1, 2, 100, buildContext("1"));

			// Assert
			await expect(call).rejects.toThrow(ErrorMessages.EXCHANGE);
			expect(update).not.toHaveBeenCalled();
		});

		it("returns null when the request carries no payload", async () => {
			// Act
			const result = await resolver.exchange(1, 2, 100, buildContext());

			// Assert
			expect(result).toBeNull();
			expect(update).not.toHaveBeenCalled();
		});
	});
});
