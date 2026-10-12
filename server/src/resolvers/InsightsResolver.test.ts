import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { printType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { InsightsResolver } from "./InsightsResolver";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";

describe("InsightsResolver", () => {
	describe("schema", () => {
		let schema: GraphQLSchema;

		beforeAll(async () => {
			schema = await buildSchema({ resolvers: [InsightsResolver], validate: false });
		});

		it("exposes the SpendingInsights types exactly as specified in the contract", () => {
			// Arrange
			const print = (name: string) => printType(schema.getType(name)!);

			// Act & Assert
			expect(print("SpendingCategory")).toBe(
				[
					"type SpendingCategory {",
					"  transactionType: String!",
					"  total: Float!",
					"  count: Int!",
					"  share: Float!",
					"}",
				].join("\n")
			);
			expect(print("DailySpend")).toBe(
				["type DailySpend {", "  date: String!", "  moneyIn: Float!", "  moneyOut: Float!", "}"].join(
					"\n"
				)
			);
			expect(print("SpendingInsights")).toBe(
				[
					"type SpendingInsights {",
					"  currency: String!",
					"  totalIn: Float!",
					"  totalOut: Float!",
					"  net: Float!",
					"  largestTransaction: Transaction",
					"  changeVsPreviousPeriodPct: Float",
					"  categories: [SpendingCategory!]!",
					"  daily: [DailySpend!]!",
					"}",
				].join("\n")
			);
		});

		it("exposes the spendingInsights query with a nullable result and days defaulting to 30", () => {
			// Arrange
			const query = schema.getQueryType() as GraphQLObjectType;

			// Act
			const field = query.getFields().spendingInsights;

			// Assert
			expect(field.type.toString()).toBe("SpendingInsights");
			expect(field.args.map((a) => `${a.name}: ${a.type}`)).toEqual([
				"currency: String!",
				"days: Int",
			]);
			expect(field.args[1].defaultValue).toBe(30);
		});
	});

	describe("spendingInsights", () => {
		const resolver = new InsightsResolver();
		const ctx = (payload?: { userId: string }) => ({ req: {} as any, res: {} as any, payload });

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("returns null when there is no payload", async () => {
			// Arrange & Act
			const result = await resolver.spendingInsights({ currency: "GBP", days: 30 }, ctx());

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the user does not exist", async () => {
			// Arrange
			jest.spyOn(User, "findOne").mockResolvedValue(undefined);

			// Act
			const result = await resolver.spendingInsights(
				{ currency: "GBP", days: 30 },
				ctx({ userId: "1" })
			);

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the currency account does not exist", async () => {
			// Arrange
			jest.spyOn(User, "findOne").mockResolvedValue({ id: 1 } as User);
			jest.spyOn(Account, "findOne").mockResolvedValue(undefined);
			const find = jest.spyOn(Transaction, "find");

			// Act
			const result = await resolver.spendingInsights(
				{ currency: "GBP", days: 30 },
				ctx({ userId: "1" })
			);

			// Assert
			expect(result).toBeNull();
			expect(find).not.toHaveBeenCalled();
		});

		it("aggregates the account's transactions and clamps days", async () => {
			// Arrange
			const owner = { id: 1 } as User;
			const account = { id: 7, currency: "GBP" } as Account;
			jest.spyOn(User, "findOne").mockResolvedValue(owner);
			jest.spyOn(Account, "findOne").mockResolvedValue(account);
			const payment = {
				id: 3,
				transactionType: "payment",
				amount: "42.5",
				date: new Date(),
			} as Transaction;
			const find = jest.spyOn(Transaction, "find").mockResolvedValue([payment]);

			// Act
			const result = await resolver.spendingInsights(
				{ currency: "GBP", days: 9999 },
				ctx({ userId: "1" })
			);

			// Assert
			expect(Account.findOne).toHaveBeenCalledWith({ where: { owner, currency: "GBP" } });
			expect(find).toHaveBeenCalledWith({
				where: { account, date: expect.anything() },
			});
			expect(result).not.toBeNull();
			expect(result!.daily).toHaveLength(365);
			expect(result!.totalOut).toBe(42.5);
			expect(result!.largestTransaction).toBe(payment);
			expect(result!.categories).toEqual([
				{ transactionType: "payment", total: 42.5, count: 1, share: 1 },
			]);
		});
	});
});
