import { getMetadataArgsStorage } from "typeorm";
import { CardResolver } from "./CardResolver";
import { Card } from "../entity/Card";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";

const buildUser = (id = 1): User => Object.assign(new User(), { id });

const buildContext = (userId?: string): MyContext =>
	({
		req: {},
		res: {},
		payload: userId === undefined ? undefined : { userId },
	} as MyContext);

const cardRelationNames = (): string[] =>
	getMetadataArgsStorage()
		.relations.filter((relation) => relation.target === Card)
		.map((relation) => relation.propertyName);

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
		it("returns the cards owned by the signed-in user", async () => {
			// Arrange
			const owner = buildUser(7);
			userFindOne.mockResolvedValue(owner);
			const cards = [Object.assign(new Card(), { id: 3 }), Object.assign(new Card(), { id: 4 })];
			const find = jest.spyOn(Card, "find").mockResolvedValue(cards);

			// Act
			const result = await resolver.cards(buildContext("7"));

			// Assert
			expect(userFindOne).toHaveBeenCalledWith({ where: { id: "7" } });
			expect(find).toHaveBeenCalledWith({ where: { owner } });
			expect(result).toBe(cards);
		});

		it("filters only on relations that exist on the Card entity", async () => {
			// Arrange
			const find = jest.spyOn(Card, "find").mockResolvedValue([]);

			// Act
			await resolver.cards(buildContext("1"));

			// Assert
			const [{ where }] = find.mock.calls[0] as [{ where: Record<string, unknown> }];
			expect(cardRelationNames()).toEqual(expect.arrayContaining(Object.keys(where)));
			expect(where).not.toHaveProperty("account");
		});

		it("returns an empty list when the user has no cards", async () => {
			// Arrange
			jest.spyOn(Card, "find").mockResolvedValue([]);

			// Act
			const result = await resolver.cards(buildContext("1"));

			// Assert
			expect(result).toEqual([]);
		});

		it("returns null when the request carries no payload", async () => {
			// Arrange
			const find = jest.spyOn(Card, "find");

			// Act
			const result = await resolver.cards(buildContext());

			// Assert
			expect(result).toBeNull();
			expect(userFindOne).not.toHaveBeenCalled();
			expect(find).not.toHaveBeenCalled();
		});

		it("returns null when the user in the token no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const find = jest.spyOn(Card, "find");

			// Act
			const result = await resolver.cards(buildContext("1"));

			// Assert
			expect(result).toBeNull();
			expect(find).not.toHaveBeenCalled();
		});
	});

	describe("createCard", () => {
		it("inserts a card owned by the signed-in user", async () => {
			// Arrange
			const owner = buildUser(7);
			userFindOne.mockResolvedValue(owner);
			const insert = jest.spyOn(Card, "insert").mockResolvedValue({} as any);

			// Act
			const result = await resolver.createCard(buildContext("7"));

			// Assert
			expect(insert).toHaveBeenCalledWith(
				expect.objectContaining({
					owner,
					cardNumber: expect.stringMatching(/^\d{4} \d{4} \d{4} \d{4}$/),
					monthlySpendingLimit: 500,
				})
			);
			expect(result).toBe(true);
		});

		it("returns false when the request carries no payload", async () => {
			// Act
			const result = await resolver.createCard(buildContext());

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
	});
});
