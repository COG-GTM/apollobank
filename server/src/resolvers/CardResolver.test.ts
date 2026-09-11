import { CardResolver } from "./CardResolver";
import { Account } from "../entity/Account";
import { Card } from "../entity/Card";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildUser = (id = 1): User => Object.assign(new User(), { id });

const buildAccount = (): Account =>
	Object.assign(new Account(), { id: 10, currency: "EUR", balance: 500 });

const buildContext = (userId?: string): MyContext =>
	({
		req: {},
		res: {},
		payload: userId === undefined ? undefined : { userId },
	} as MyContext);

describe("CardResolver", () => {
	const resolver = new CardResolver();
	let userFindOne: jest.SpyInstance;

	beforeEach(() => {
		userFindOne = jest.spyOn(User, "findOne").mockResolvedValue(buildUser());
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("cards", () => {
		it("returns the cards linked to the users account", async () => {
			// Arrange
			const cards = [Object.assign(new Card(), { id: 3 })];
			jest.spyOn(Account, "findOne").mockResolvedValue(buildAccount());
			const find = jest.spyOn(Card, "find").mockResolvedValue(cards);

			// Act
			const result = await resolver.cards(buildContext("1"));

			// Assert
			expect(find).toHaveBeenCalledWith({ where: { account: buildAccount() } });
			expect(result).toBe(cards);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.cards(context);

			// Assert
			expect(result).toBeNull();
			expect(userFindOne).not.toHaveBeenCalled();
		});

		it("returns null when the user owns no account", async () => {
			// Arrange
			jest.spyOn(Account, "findOne").mockResolvedValue(undefined);

			// Act
			const result = await resolver.cards(buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);

			// Act
			const result = await resolver.cards(buildContext("1"));

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("createCard", () => {
		it("inserts a card with generated details and a 500 spending limit", async () => {
			// Arrange
			const insert = jest.spyOn(Card, "insert").mockResolvedValue({} as any);

			// Act
			const result = await resolver.createCard(buildContext("1"));

			// Assert
			expect(insert).toHaveBeenCalledWith(
				expect.objectContaining({
					owner: buildUser(),
					cardNumber: expect.stringMatching(/^\d{4} \d{4} \d{4} \d{4}$/),
					monthlySpendingLimit: 500,
				})
			);
			const inserted = insert.mock.calls[0][0] as { pin: number; cvv: number };
			expect(inserted.pin).toBeGreaterThanOrEqual(0);
			expect(inserted.cvv).toBeGreaterThanOrEqual(0);
			expect(result).toBe(true);
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.createCard(context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns false when the insert fails", async () => {
			// Arrange
			jest.spyOn(Card, "insert").mockRejectedValue(new Error("db down"));

			// Act
			const result = await resolver.createCard(buildContext("1"));

			// Assert
			expect(result).toBe(false);
		});

		it("returns true without inserting when the user no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const insert = jest.spyOn(Card, "insert");

			// Act
			const result = await resolver.createCard(buildContext("1"));

			// Assert
			expect(insert).not.toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});
});
