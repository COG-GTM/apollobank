import { buildSchema } from "type-graphql";
import { printSchema, GraphQLSchema } from "graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { AccountResolver } from "./resolvers/AccountResolver";
import { TransactionResolver } from "./resolvers/TransactionResolver";
import { CardResolver } from "./resolvers/CardResolver";

describe("GraphQL schema", () => {
	let schema: GraphQLSchema;
	let sdl: string;

	beforeAll(async () => {
		// Arrange & Act
		schema = await buildSchema({
			resolvers: [UserResolver, AccountResolver, TransactionResolver, CardResolver],
		});
		sdl = printSchema(schema);
	});

	it("exposes the account, card, transaction and user queries", () => {
		// Assert
		const queryFields = Object.keys(schema.getQueryType()!.getFields());
		expect(queryFields.sort()).toEqual(["account", "accounts", "cards", "me", "transactions"]);
	});

	it("exposes every money movement and account lifecycle mutation", () => {
		// Assert
		const mutationFields = Object.keys(schema.getMutationType()!.getFields());
		expect(mutationFields.sort()).toEqual(
			[
				"addMoney",
				"createAccount",
				"createCard",
				"createTransaction",
				"deleteAccount",
				"destroyAccount",
				"exchange",
				"login",
				"logout",
				"register",
				"revokeRefreshTokensForUser",
				"updatePassword",
			].sort()
		);
	});

	it("types the account fields returned to clients", () => {
		// Assert
		expect(sdl).toContain("type Account {");
		expect(sdl).toContain("balance: Float!");
		expect(sdl).toContain("currency: String!");
	});

	it("never exposes the user password", () => {
		// Assert
		const userFields = Object.keys(
			(schema.getType("User") as any).getFields() as Record<string, unknown>
		);
		expect(userFields).not.toContain("password");
		expect(userFields).toContain("email");
	});

	it("types the exchange mutation with its currency and amount arguments", () => {
		// Assert
		const exchange = schema.getMutationType()!.getFields()["exchange"];
		expect(exchange.args.map((arg) => arg.name).sort()).toEqual([
			"amount",
			"selectedAccountCurrency",
			"toAccountCurrency",
		]);
		expect(String(exchange.type)).toBe("AccountResponse!");
	});
});
