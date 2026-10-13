import { graphql, GraphQLSchema, printSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { sign } from "jsonwebtoken";
import { InsightsResolver } from "./InsightsResolver";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";

const SECRET = "test-access-secret";

const QUERY = `
	query SpendingInsights($currency: String!, $days: Int) {
		spendingInsights(currency: $currency, days: $days) {
			currency
			totalIn
			totalOut
			net
			changeVsPreviousPeriodPct
			largestTransaction { id amount transactionType }
			categories { transactionType total count share }
			daily { date moneyIn moneyOut }
		}
	}
`;

const authContext = (userId = "1") => ({
	req: { headers: { authorization: `Bearer ${sign({ userId }, SECRET)}` } },
	res: {},
});

describe("InsightsResolver", () => {
	let schema: GraphQLSchema;
	let sdl: string;

	beforeAll(async () => {
		process.env.ACCESS_TOKEN_SECRET = SECRET;
		schema = await buildSchema({ resolvers: [InsightsResolver] });
		sdl = printSchema(schema);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("schema", () => {
		it("exposes spendingInsights with the contract's argument order, default and nullability", () => {
			expect(sdl).toContain(
				"spendingInsights(currency: String!, days: Int = 30): SpendingInsights\n"
			);
		});

		it("prints the contract object types", () => {
			expect(sdl).toContain(
				"type SpendingCategory {\n  transactionType: String!\n  total: Float!\n  count: Int!\n  share: Float!\n}"
			);
			expect(sdl).toContain("type DailySpend {\n  date: String!\n  moneyIn: Float!\n  moneyOut: Float!\n}");
			expect(sdl).toContain(
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
	});

	describe("authentication", () => {
		it("rejects calls without an Authorization header", async () => {
			const findUser = jest.spyOn(User, "findOne");

			const result = await graphql({
				schema,
				source: QUERY,
				variableValues: { currency: "GBP" },
				contextValue: { req: { headers: {} }, res: {} },
			});

			expect(result.errors?.[0].message).toBe("Not authenticated");
			expect(result.data).toEqual({ spendingInsights: null });
			expect(findUser).not.toHaveBeenCalled();
		});
	});

	describe("spendingInsights", () => {
		it("loads the user's currency account and aggregates transactions from the previous window onward", async () => {
			const owner = { id: 1 } as User;
			const account = { id: 7, currency: "GBP" } as Account;
			const today = new Date();
			jest.spyOn(User, "findOne").mockResolvedValue(owner);
			jest.spyOn(Account, "findOne").mockResolvedValue(account);
			const findTransactions = jest.spyOn(Transaction, "find").mockResolvedValue([
				{ id: 11, transactionType: "deposit", amount: "200", date: today } as Transaction,
				{ id: 12, transactionType: "payment", amount: "50", date: today } as Transaction,
			]);

			const result = await graphql({
				schema,
				source: QUERY,
				variableValues: { currency: "GBP", days: 7 },
				contextValue: authContext(),
			});

			expect(result.errors).toBeUndefined();
			expect(User.findOne).toHaveBeenCalledWith({ where: { id: "1" } });
			expect(Account.findOne).toHaveBeenCalledWith({ where: { owner, currency: "GBP" } });
			const where = (findTransactions.mock.calls[0][0] as any).where;
			expect(where.account).toBe(account);
			expect(where.date.type).toBe("moreThanOrEqual");
			const expectedPreviousStart = new Date(
				Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - 13 * 86400000
			);
			expect(where.date.value).toEqual(expectedPreviousStart);

			const insights = (result.data as any).spendingInsights;
			expect(insights).toMatchObject({
				currency: "GBP",
				totalIn: 200,
				totalOut: 50,
				net: 150,
				changeVsPreviousPeriodPct: null,
				largestTransaction: { id: 11, amount: "200", transactionType: "deposit" },
				categories: [{ transactionType: "payment", total: 50, count: 1, share: 1 }],
			});
			expect(insights.daily).toHaveLength(7);
			expect(insights.daily[6]).toEqual({
				date: today.toISOString().slice(0, 10),
				moneyIn: 200,
				moneyOut: 50,
			});
		});

		it("defaults to a 30-day window", async () => {
			jest.spyOn(User, "findOne").mockResolvedValue({ id: 1 } as User);
			jest.spyOn(Account, "findOne").mockResolvedValue({ id: 7 } as Account);
			jest.spyOn(Transaction, "find").mockResolvedValue([]);

			const result = await graphql({
				schema,
				source: QUERY,
				variableValues: { currency: "GBP" },
				contextValue: authContext(),
			});

			expect((result.data as any).spendingInsights.daily).toHaveLength(30);
		});

		it("returns null when the user has no account in that currency", async () => {
			jest.spyOn(User, "findOne").mockResolvedValue({ id: 1 } as User);
			jest.spyOn(Account, "findOne").mockResolvedValue(undefined);
			const findTransactions = jest.spyOn(Transaction, "find");

			const result = await graphql({
				schema,
				source: QUERY,
				variableValues: { currency: "JPY" },
				contextValue: authContext(),
			});

			expect(result.errors).toBeUndefined();
			expect(result.data).toEqual({ spendingInsights: null });
			expect(findTransactions).not.toHaveBeenCalled();
		});

		it("returns null when the token's user no longer exists", async () => {
			jest.spyOn(User, "findOne").mockResolvedValue(undefined);
			const findAccount = jest.spyOn(Account, "findOne");

			const result = await graphql({
				schema,
				source: QUERY,
				variableValues: { currency: "GBP" },
				contextValue: authContext("404"),
			});

			expect(result.data).toEqual({ spendingInsights: null });
			expect(findAccount).not.toHaveBeenCalled();
		});

		it("returns null when no payload is present on the context", async () => {
			const resolver = new InsightsResolver();

			const result = await resolver.spendingInsights({ currency: "GBP", days: 30 }, {} as any);

			expect(result).toBeNull();
		});
	});
});
