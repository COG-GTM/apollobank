import * as typeorm from "typeorm";
import { createTypeOrmConnection } from "./createTypeOrmConnection";
import { User } from "../entity/User";
import { Account } from "../entity/Account";
import { Transaction } from "../entity/Transaction";
import { Card } from "../entity/Card";

describe("createTypeOrmConnection", () => {
	const originalNodeEnv = process.env.NODE_ENV;
	const originalDatabaseUrl = process.env.DATABASE_URL;
	let mockedGetConnectionOptions: jest.SpyInstance;
	let mockedCreateConnection: jest.SpyInstance;

	beforeEach(() => {
		mockedGetConnectionOptions = jest
			.spyOn(typeorm, "getConnectionOptions")
			.mockResolvedValue({ type: "postgres" } as typeorm.ConnectionOptions);
		mockedCreateConnection = jest
			.spyOn(typeorm, "createConnection")
			.mockResolvedValue("connection" as unknown as typeorm.Connection);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		process.env.NODE_ENV = originalNodeEnv;
		process.env.DATABASE_URL = originalDatabaseUrl;
	});

	it("uses the database url and explicit entities in production", async () => {
		// Arrange
		process.env.NODE_ENV = "production";
		process.env.DATABASE_URL = "postgres://user:pass@host/db";

		// Act
		const connection = (await createTypeOrmConnection()) as unknown as string;

		// Assert
		expect(mockedGetConnectionOptions).toHaveBeenCalledWith("production");
		expect(mockedCreateConnection).toHaveBeenCalledWith({
			type: "postgres",
			url: "postgres://user:pass@host/db",
			entities: [User, Account, Transaction, Card],
			name: "default",
		});
		expect(connection).toBe("connection");
	});

	it("uses the ormconfig options outside of production", async () => {
		// Arrange
		process.env.NODE_ENV = "development";

		// Act
		await createTypeOrmConnection();

		// Assert
		expect(mockedGetConnectionOptions).toHaveBeenCalledWith("development");
		expect(mockedCreateConnection).toHaveBeenCalledWith({ type: "postgres", name: "default" });
	});
});
