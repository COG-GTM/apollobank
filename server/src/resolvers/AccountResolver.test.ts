import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { ErrorMessages, SuccessMessages } from "../utils/messages";

const buildUser = (id = 1): User => Object.assign(new User(), { id });

const buildAccount = (overrides: Partial<Account> = {}): Account =>
	Object.assign(new Account(), { id: 10, currency: "EUR", balance: 1000 }, overrides);

const buildContext = (userId?: string): MyContext =>
	({
		req: {},
		res: {},
		payload: userId === undefined ? undefined : { userId },
	} as MyContext);

/**
 * Resolves Account.findOne calls by the currency in the query, so a single test can
 * describe the state of every currency account the user owns.
 */
const mockAccountsByCurrency = (accounts: Record<string, Account | undefined>) =>
	jest
		.spyOn(Account, "findOne")
		.mockImplementation(async (options?: any) => accounts[options?.where?.currency]);

describe("AccountResolver", () => {
	const resolver = new AccountResolver();
	let userFindOne: jest.SpyInstance;

	beforeEach(() => {
		userFindOne = jest.spyOn(User, "findOne").mockResolvedValue(buildUser());
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("accounts", () => {
		it("returns every account belonging to the authenticated user", async () => {
			// Arrange
			const owned = [buildAccount(), buildAccount({ id: 11, currency: "USD" })];
			const find = jest.spyOn(Account, "find").mockResolvedValue(owned);

			// Act
			const result = await resolver.accounts(buildContext("1"));

			// Assert
			expect(find).toHaveBeenCalledWith({ where: { owner: buildUser() } });
			expect(result).toBe(owned);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.accounts(context);

			// Assert
			expect(result).toBeNull();
			expect(userFindOne).not.toHaveBeenCalled();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.accounts(buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("account", () => {
		it("returns the account matching the requested currency", async () => {
			// Arrange
			const eur = buildAccount();
			mockAccountsByCurrency({ EUR: eur });

			// Act
			const result = await resolver.account("EUR", buildContext("1"));

			// Assert
			expect(result).toBe(eur);
		});

		it("throws when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act & Assert
			await expect(resolver.account("EUR", context)).rejects.toThrow();
		});

		it("returns undefined when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.account("EUR", buildContext("1"));

			// Assert
			expect(result).toBeUndefined();
		});
	});

	describe("addMoney", () => {
		it("credits the account and returns the updated balance", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount({ balance: 1000 }) });
			const update = jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act
			const result = await resolver.addMoney(250, "EUR", buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 10 }, { balance: 1250 });
			expect(result?.message).toBe(SuccessMessages.ADD_MONEY);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.addMoney(100, "EUR", context);

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the user owns no account in that currency", async () => {
			// Arrange
			mockAccountsByCurrency({});
			const update = jest.spyOn(Account, "update");

			// Act
			const result = await resolver.addMoney(100, "EUR", buildContext("1"));

			// Assert
			expect(update).not.toHaveBeenCalled();
			expect(result).toBeNull();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			mockAccountsByCurrency({});

			// Act
			const result = await resolver.addMoney(100, "EUR", buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("throws when persisting the new balance fails", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount() });
			jest.spyOn(Account, "update").mockRejectedValue(new Error("db down"));

			// Act & Assert
			await expect(resolver.addMoney(100, "EUR", buildContext("1"))).rejects.toThrow(
				ErrorMessages.ADD_MONEY
			);
		});

		it("throws when reloading the account fails", async () => {
			// Arrange
			const account = buildAccount();
			jest
				.spyOn(Account, "findOne")
				.mockResolvedValueOnce(account)
				.mockRejectedValueOnce(new Error("db down"));
			jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act & Assert
			await expect(resolver.addMoney(100, "EUR", buildContext("1"))).rejects.toThrow(
				ErrorMessages.ADD_MONEY
			);
		});
	});

	describe("exchange", () => {
		const setUpExchange = (from: Partial<Account>, to: Partial<Account> | undefined) => {
			const source = buildAccount({ id: 1, currency: "EUR", balance: 1000, ...from });
			const target = to && buildAccount({ id: 2, currency: "USD", balance: 0, ...to });
			mockAccountsByCurrency({ [source.currency]: source, ...(target && { [target.currency]: target }) });
			const update = jest.spyOn(Account, "update").mockResolvedValue({} as any);
			return { source, target, update };
		};

		it.each([
			["EUR", "USD", 100, 111],
			["EUR", "GBP", 100, 89],
			["USD", "EUR", 100, 90],
			["USD", "GBP", 100, 80],
			["GBP", "USD", 100, 125],
			["GBP", "EUR", 100, 113],
		])(
			"credits the %s to %s target account with the converted amount",
			async (from, to, amount, converted) => {
				// Arrange
				const { update } = setUpExchange(
					{ currency: from, balance: 1000 },
					{ currency: to, balance: 0 }
				);

				// Act
				const result = await resolver.exchange(from, to, amount, buildContext("1"));

				// Assert
				expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: converted });
				expect(result?.message).toBe(SuccessMessages.EXCHANGE);
			}
		);

		it("debits the source account by the amount requested in the source currency", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, { balance: 0 });

			// Act
			await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 900 });
		});

		it("allows exchanging a balance that exactly equals the amount", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 100 }, { balance: 0 });

			// Act
			await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 0 });
			expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 111 });
		});

		it("moves nothing when the amount is zero", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, { balance: 0 });

			// Act
			await resolver.exchange("EUR", "USD", 0, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 1000 });
			expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 0 });
		});

		it("credits the source account when the amount is negative", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, { balance: 500 });

			// Act
			await resolver.exchange("EUR", "USD", -100, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { balance: 1100 });
			expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 389 });
		});

		it("moves no money when no conversion rate exists for the pair", async () => {
			// Arrange
			const { update } = setUpExchange(
				{ currency: "EUR", balance: 1000 },
				{ currency: "JPY", balance: 0 }
			);

			// Act
			const result = await resolver.exchange("EUR", "JPY", 100, buildContext("1"));

			// Assert
			expect(update).not.toHaveBeenCalled();
			expect(result?.message).toBe(SuccessMessages.EXCHANGE);
		});

		it("only looks at accounts owned by the caller", async () => {
			// Arrange
			const findOne = mockAccountsByCurrency({});
			jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act
			const result = await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(findOne).toHaveBeenCalledWith({
				where: { owner: buildUser(), currency: "EUR" },
			});
			expect(result).toBeNull();
		});

		it("debits the same stale balance twice when the same exchange is submitted twice", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, { balance: 0 });

			// Act
			await Promise.all([
				resolver.exchange("EUR", "USD", 100, buildContext("1")),
				resolver.exchange("EUR", "USD", 100, buildContext("1")),
			]);

			// Assert
			expect(update.mock.calls.filter(([criteria]) => (criteria as any).id === 1)).toEqual([
				[{ id: 1 }, { balance: 900 }],
				[{ id: 1 }, { balance: 900 }],
			]);
		});

		it("rounds the credited amount to the nearest whole unit", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, { balance: 0 });

			// Act
			await resolver.exchange("EUR", "USD", 0.4, buildContext("1"));

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 2 }, { balance: 0 });
		});

		it("moves no money when exchanging into the same currency", async () => {
			// Arrange
			const source = buildAccount({ id: 1, currency: "EUR", balance: 1000 });
			mockAccountsByCurrency({ EUR: source });
			const update = jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act
			const result = await resolver.exchange("EUR", "EUR", 100, buildContext("1"));

			// Assert
			expect(update).not.toHaveBeenCalled();
			expect(result?.message).toBe(SuccessMessages.EXCHANGE);
		});

		it("throws when the balance is lower than the requested amount", async () => {
			// Arrange
			setUpExchange({ balance: 50 }, { balance: 0 });

			// Act & Assert
			await expect(resolver.exchange("EUR", "USD", 100, buildContext("1"))).rejects.toThrow(
				ErrorMessages.EXCHANGE
			);
		});

		it("throws when the requested amount is not a number", async () => {
			// Arrange
			setUpExchange({ balance: 1000 }, { balance: 0 });

			// Act & Assert
			await expect(resolver.exchange("EUR", "USD", NaN, buildContext("1"))).rejects.toThrow(
				ErrorMessages.EXCHANGE
			);
		});

		it("throws when persisting the new balances fails", async () => {
			// Arrange
			setUpExchange({ balance: 1000 }, { balance: 0 });
			jest.spyOn(Account, "update").mockRejectedValue(new Error("db down"));

			// Act & Assert
			await expect(resolver.exchange("EUR", "USD", 100, buildContext("1"))).rejects.toThrow(
				ErrorMessages.EXCHANGE
			);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.exchange("EUR", "USD", 100, context);

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the source account does not exist", async () => {
			// Arrange
			mockAccountsByCurrency({});

			// Act
			const result = await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("leaves balances untouched when the target account does not exist", async () => {
			// Arrange
			const { update } = setUpExchange({ balance: 1000 }, undefined);

			// Act
			const result = await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(update).not.toHaveBeenCalled();
			expect(result?.message).toBe(SuccessMessages.EXCHANGE);
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			mockAccountsByCurrency({});

			// Act
			const result = await resolver.exchange("EUR", "USD", 100, buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("throws when reloading the source account fails", async () => {
			// Arrange
			const source = buildAccount({ id: 1, currency: "EUR", balance: 1000 });
			const target = buildAccount({ id: 2, currency: "USD", balance: 0 });
			jest
				.spyOn(Account, "findOne")
				.mockResolvedValueOnce(source)
				.mockResolvedValueOnce(target)
				.mockRejectedValueOnce(new Error("db down"));
			jest.spyOn(Account, "update").mockResolvedValue({} as any);

			// Act & Assert
			await expect(resolver.exchange("EUR", "USD", 100, buildContext("1"))).rejects.toThrow(
				ErrorMessages.EXCHANGE
			);
		});
	});

	describe("createAccount", () => {
		it("creates a GBP account with a generated sort code", async () => {
			// Arrange
			mockAccountsByCurrency({});
			const insert = jest.spyOn(Account, "insert").mockResolvedValue({} as any);

			// Act
			const result = await resolver.createAccount("GBP", buildContext("1"));

			// Assert
			expect(insert).toHaveBeenCalledWith(
				expect.objectContaining({ currency: "GBP", sortCode: expect.stringMatching(/^\d{2}-\d{2}-\d{2}$/) })
			);
			expect(result).toBe(true);
		});

		it("creates a non GBP account with the placeholder sort code", async () => {
			// Arrange
			mockAccountsByCurrency({});
			const insert = jest.spyOn(Account, "insert").mockResolvedValue({} as any);

			// Act
			await resolver.createAccount("USD", buildContext("1"));

			// Assert
			expect(insert).toHaveBeenCalledWith(expect.objectContaining({ sortCode: "00-00-00" }));
		});

		it("throws when the user already owns an account in that currency", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount() });

			// Act & Assert
			await expect(resolver.createAccount("EUR", buildContext("1"))).rejects.toThrow(
				"You already have a EUR account"
			);
		});

		it("returns false when the insert fails", async () => {
			// Arrange
			mockAccountsByCurrency({});
			jest.spyOn(Account, "insert").mockRejectedValue(new Error("db down"));

			// Act
			const result = await resolver.createAccount("USD", buildContext("1"));

			// Assert
			expect(result).toBe(false);
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.createAccount("USD", context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns true without inserting when the user no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const insert = jest.spyOn(Account, "insert");

			// Act
			const result = await resolver.createAccount("USD", buildContext("1"));

			// Assert
			expect(insert).not.toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});

	describe("deleteAccount", () => {
		it("deletes an empty account", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount({ balance: 0 }) });
			const remove = jest.spyOn(Account, "delete").mockResolvedValue({} as any);

			// Act
			const result = await resolver.deleteAccount("EUR", buildContext("1"));

			// Assert
			expect(remove).toHaveBeenCalledWith({ id: 10 });
			expect(result).toBe(true);
		});

		it("returns false when the delete fails", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount({ balance: 0 }) });
			jest.spyOn(Account, "delete").mockRejectedValue(new Error("db down"));

			// Act
			const result = await resolver.deleteAccount("EUR", buildContext("1"));

			// Assert
			expect(result).toBe(false);
		});

		it("refuses to delete an account that is overdrawn", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount({ balance: -1 }) });

			// Act & Assert
			await expect(resolver.deleteAccount("EUR", buildContext("1"))).rejects.toThrow(
				ErrorMessages.BALANCE_LESS_THAN
			);
		});

		it("refuses to delete an account that still holds funds", async () => {
			// Arrange
			mockAccountsByCurrency({ EUR: buildAccount({ balance: 1 }) });

			// Act & Assert
			await expect(resolver.deleteAccount("EUR", buildContext("1"))).rejects.toThrow(
				ErrorMessages.BALANCE_GREATER_THAN
			);
		});

		it("returns true when the account does not exist", async () => {
			// Arrange
			mockAccountsByCurrency({});

			// Act
			const result = await resolver.deleteAccount("EUR", buildContext("1"));

			// Assert
			expect(result).toBe(true);
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.deleteAccount("EUR", context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns true when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.deleteAccount("EUR", buildContext("1"));

			// Assert
			expect(result).toBe(true);
		});
	});
});
