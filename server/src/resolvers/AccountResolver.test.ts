import { AccountResolver } from "./AccountResolver";
import { Account } from "../entity/Account";
import { User } from "../entity/User";
import { ErrorMessages, SuccessMessages } from "../utils/messages";
import { MyContext } from "../MyContext";

const owner = { id: 1 } as User;

const makeAccount = (id: number, currency: string, balance: number): Account =>
	({ id, currency, balance } as Account);

const context = { payload: { userId: "1" } } as unknown as MyContext;

/**
 * Mocks TypeORM so that Account.findOne returns the in-memory account for the
 * requested currency and Account.update writes the new balance back to it
 */
const mockAccounts = (accounts: Account[]) => {
	jest.spyOn(User, "findOne").mockResolvedValue(owner);

	const findOne = jest
		.spyOn(Account, "findOne")
		.mockImplementation((async (options: { where: { currency: string } }) => {
			const account = accounts.find((a) => a.currency === options.where.currency);
			return account ? { ...account } : undefined;
		}) as any);

	const update = jest.spyOn(Account, "update").mockImplementation((async (
		criteria: { id: number },
		partial: { balance: number }
	) => {
		const account = accounts.find((a) => a.id === criteria.id);
		if (account) {
			account.balance = partial.balance;
		}
		return {} as any;
	}) as any);

	return { findOne, update };
};

describe("AccountResolver.exchange", () => {
	let resolver: AccountResolver;
	let eur: Account;
	let usd: Account;
	let gbp: Account;

	beforeEach(() => {
		resolver = new AccountResolver();
		eur = makeAccount(1, "EUR", 1000);
		usd = makeAccount(2, "USD", 500);
		gbp = makeAccount(3, "GBP", 200);
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("debits the source by the amount entered and credits the target by the converted amount", async () => {
		// Arrange
		mockAccounts([eur, usd, gbp]);

		// Act
		const response = await resolver.exchange("EUR", "USD", 100, context);

		// Assert
		expect(eur.balance).toBe(900);
		expect(usd.balance).toBe(611);
		expect(response).toEqual({
			account: expect.objectContaining({ currency: "EUR", balance: 900 }),
			message: SuccessMessages.EXCHANGE,
		});
	});

	it.each([
		["EUR", "GBP", 100, 900, 289],
		["USD", "EUR", 100, 400, 1090],
		["USD", "GBP", 100, 400, 280],
		["GBP", "USD", 100, 100, 625],
		["GBP", "EUR", 100, 100, 1113],
	])(
		"exchanging %s to %s debits %d from the source",
		async (from, to, amount, expectedFrom, expectedTo) => {
			// Arrange
			const accounts = [eur, usd, gbp];
			mockAccounts(accounts);
			const source = accounts.find((a) => a.currency === from)!;
			const target = accounts.find((a) => a.currency === to)!;

			// Act
			await resolver.exchange(from, to, amount, context);

			// Assert
			expect(source.balance).toBe(expectedFrom);
			expect(target.balance).toBe(expectedTo);
		}
	);

	it("allows exchanging the whole source balance even when the converted amount is larger", async () => {
		// Arrange
		mockAccounts([eur, usd, gbp]);

		// Act
		await resolver.exchange("GBP", "EUR", 200, context);

		// Assert
		expect(gbp.balance).toBe(0);
		expect(eur.balance).toBe(1226);
	});

	it("rejects with ErrorMessages.EXCHANGE when the source balance is less than the amount and leaves both balances", async () => {
		// Arrange
		const { update } = mockAccounts([eur, usd, gbp]);

		// Act
		const exchange = resolver.exchange("GBP", "USD", 201, context);

		// Assert
		await expect(exchange).rejects.toThrow(ErrorMessages.EXCHANGE);
		expect(update).not.toHaveBeenCalled();
		expect(gbp.balance).toBe(200);
		expect(usd.balance).toBe(500);
	});

	it("rejects an exchange to the same currency and leaves the balance", async () => {
		// Arrange
		const { update } = mockAccounts([eur, usd, gbp]);

		// Act
		const exchange = resolver.exchange("EUR", "EUR", 100, context);

		// Assert
		await expect(exchange).rejects.toThrow(ErrorMessages.EXCHANGE_INVALID);
		expect(update).not.toHaveBeenCalled();
		expect(eur.balance).toBe(1000);
	});

	it.each([0, -50, NaN])("rejects an amount of %d and leaves both balances", async (amount) => {
		// Arrange
		const { update } = mockAccounts([eur, usd, gbp]);

		// Act
		const exchange = resolver.exchange("EUR", "USD", amount, context);

		// Assert
		await expect(exchange).rejects.toThrow(ErrorMessages.EXCHANGE_INVALID);
		expect(update).not.toHaveBeenCalled();
		expect(eur.balance).toBe(1000);
		expect(usd.balance).toBe(500);
	});

	it("rejects an unsupported currency pair and leaves the balance", async () => {
		// Arrange
		const { update } = mockAccounts([eur, usd, gbp]);

		// Act
		const exchange = resolver.exchange("EUR", "JPY", 100, context);

		// Assert
		await expect(exchange).rejects.toThrow(ErrorMessages.EXCHANGE_INVALID);
		expect(update).not.toHaveBeenCalled();
	});

	it("rejects with ErrorMessages.EXCHANGE when a balance update fails", async () => {
		// Arrange
		const { update } = mockAccounts([eur, usd, gbp]);
		update.mockRejectedValueOnce(new Error("db down"));

		// Act
		const exchange = resolver.exchange("EUR", "USD", 100, context);

		// Assert
		await expect(exchange).rejects.toThrow(ErrorMessages.EXCHANGE);
		expect(eur.balance).toBe(1000);
	});

	it("returns null without touching accounts when there is no payload", async () => {
		// Arrange
		const { findOne, update } = mockAccounts([eur, usd, gbp]);

		// Act
		const response = await resolver.exchange("EUR", "USD", 100, {} as MyContext);

		// Assert
		expect(response).toBeNull();
		expect(findOne).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
	});
});
