import * as typeorm from "typeorm";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { UserResolver } from "./UserResolver";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { ErrorMessages } from "../utils/messages";
import * as sendRefreshTokenModule from "../utils/sendRefreshToken";

jest.mock("bcryptjs", () => ({
	hash: jest.fn(),
	compare: jest.fn(),
}));

const mockedHash = hash as unknown as jest.Mock;
const mockedCompare = compare as unknown as jest.Mock;

const buildUser = (overrides: Partial<User> = {}): User =>
	Object.assign(
		new User(),
		{ id: 1, email: "user@apollobank.com", password: "hashed", tokenVersion: 0 },
		overrides
	);

const buildContext = (overrides: Partial<MyContext> = {}): MyContext =>
	({
		req: { headers: {} },
		res: { cookie: jest.fn() },
		...overrides,
	} as MyContext);

describe("UserResolver", () => {
	const resolver = new UserResolver();
	let userFindOne: jest.SpyInstance;

	beforeEach(() => {
		userFindOne = jest.spyOn(User, "findOne").mockResolvedValue(buildUser());
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockedHash.mockReset();
		mockedCompare.mockReset();
	});

	describe("me", () => {
		it("returns the user encoded in a valid access token", async () => {
			// Arrange
			const token = sign({ userId: 1 }, process.env.ACCESS_TOKEN_SECRET!);
			const context = buildContext({ req: { headers: { authorization: `bearer ${token}` } } as any });

			// Act
			const result = await resolver.me(context);

			// Assert
			expect(userFindOne).toHaveBeenCalledWith(1);
			expect(context.payload).toMatchObject({ userId: 1 });
			expect(result).toEqual(buildUser());
		});

		it("returns null when no authorization header is present", () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = resolver.me(context);

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the token cannot be verified", () => {
			// Arrange
			const token = sign({ userId: 1 }, "another-secret");
			const context = buildContext({ req: { headers: { authorization: `bearer ${token}` } } as any });

			// Act
			const result = resolver.me(context);

			// Assert
			expect(result).toBeNull();
		});

		it("returns null when the token has expired", () => {
			// Arrange
			const token = sign({ userId: 1 }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "-1s" });
			const context = buildContext({ req: { headers: { authorization: `bearer ${token}` } } as any });

			// Act
			const result = resolver.me(context);

			// Assert
			expect(result).toBeNull();
		});
	});

	describe("logout", () => {
		it("clears the refresh token cookie", async () => {
			// Arrange
			const sendRefreshToken = jest
				.spyOn(sendRefreshTokenModule, "sendRefreshToken")
				.mockImplementation(() => ({} as any));
			const context = buildContext();

			// Act
			const result = await resolver.logout(context);

			// Assert
			expect(sendRefreshToken).toHaveBeenCalledWith(context.res, "");
			expect(result).toBe(true);
		});
	});

	describe("revokeRefreshTokensForUser", () => {
		it("increments the token version of the user", async () => {
			// Arrange
			const increment = jest.fn().mockResolvedValue({});
			jest
				.spyOn(typeorm, "getConnection")
				.mockReturnValue({ getRepository: () => ({ increment }) } as any);

			// Act
			const result = await resolver.revokeRefreshTokensForUser(42);

			// Assert
			expect(increment).toHaveBeenCalledWith({ id: 42 }, "tokenVersion", 1);
			expect(result).toBe(true);
		});
	});

	describe("login", () => {
		it("returns an access token and the user for valid credentials", async () => {
			// Arrange
			mockedCompare.mockResolvedValue(true);
			jest
				.spyOn(sendRefreshTokenModule, "sendRefreshToken")
				.mockImplementation(() => ({} as any));
			const context = buildContext();

			// Act
			const result = await resolver.login("user@apollobank.com", "password123", context);

			// Assert
			expect(result.accessToken).toEqual(expect.any(String));
			expect(result.user).toEqual(buildUser());
		});

		it("rejects credentials that fail schema validation", async () => {
			// Arrange
			const context = buildContext();

			// Act & Assert
			await expect(resolver.login("not-an-email", "password123", context)).rejects.toThrow(
				"Something went wrong."
			);
		});

		it("throws an invalid login error when the email is unknown", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const context = buildContext();

			// Act & Assert
			await expect(
				resolver.login("user@apollobank.com", "password123", context)
			).rejects.toThrow(ErrorMessages.LOGIN);
		});

		it("throws an invalid password error when the password does not match", async () => {
			// Arrange
			mockedCompare.mockResolvedValue(false);
			const context = buildContext();

			// Act & Assert
			await expect(
				resolver.login("user@apollobank.com", "password123", context)
			).rejects.toThrow(ErrorMessages.PASSWORD);
		});
	});

	describe("register", () => {
		const validArgs: [string, string, string, string, string, string, string, string, string] = [
			"new@apollobank.com",
			"password123",
			"Ada",
			"Lovelace",
			"1990-01-01",
			"1 Demo Street",
			"00100",
			"Helsinki",
			"Finland",
		];

		it("hashes the password and inserts the new user", async () => {
			// Arrange
			mockedHash.mockResolvedValue("hashed-password");
			const insert = jest.spyOn(User, "insert").mockResolvedValue({} as any);

			// Act
			const result = await resolver.register(...validArgs);

			// Assert
			expect(insert).toHaveBeenCalledWith(
				expect.objectContaining({ email: "new@apollobank.com", password: "hashed-password" })
			);
			expect(result).toBe(true);
		});

		it("returns false when the registration payload fails validation", async () => {
			// Arrange
			const insert = jest.spyOn(User, "insert");

			// Act
			const result = await resolver.register(
				"not-an-email",
				...(validArgs.slice(1) as [string, string, string, string, string, string, string, string])
			);

			// Assert
			expect(insert).not.toHaveBeenCalled();
			expect(result).toBe(false);
		});

		it("returns false when the insert fails, for example on a duplicate email", async () => {
			// Arrange
			mockedHash.mockResolvedValue("hashed-password");
			jest.spyOn(User, "insert").mockRejectedValue(new Error("duplicate key"));

			// Act
			const result = await resolver.register(...validArgs);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe("updatePassword", () => {
		it("stores the new hashed password when the old password matches", async () => {
			// Arrange
			mockedCompare.mockResolvedValue(true);
			mockedHash.mockResolvedValue("new-hash");
			const update = jest.spyOn(User, "update").mockResolvedValue({} as any);
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.updatePassword("password123", "password456", context);

			// Assert
			expect(update).toHaveBeenCalledWith({ id: 1 }, { password: "new-hash" });
			expect(result).toBe(true);
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.updatePassword("password123", "password456", context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns false when the new password fails validation", async () => {
			// Arrange
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.updatePassword("password123", "short", context);

			// Assert
			expect(result).toBe(false);
		});

		it("throws when the old password does not match", async () => {
			// Arrange
			mockedCompare.mockResolvedValue(false);
			const context = buildContext({ payload: { userId: "1" } });

			// Act & Assert
			await expect(
				resolver.updatePassword("wrongpassword", "password456", context)
			).rejects.toThrow(ErrorMessages.UPDATE_PASSWORD);
		});

		it("returns false when persisting the new password fails", async () => {
			// Arrange
			mockedCompare.mockResolvedValue(true);
			mockedHash.mockResolvedValue("new-hash");
			jest.spyOn(User, "update").mockRejectedValue(new Error("db down"));
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.updatePassword("password123", "password456", context);

			// Assert
			expect(result).toBe(false);
		});

		it("returns true without updating when the user no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const update = jest.spyOn(User, "update");
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.updatePassword("password123", "password456", context);

			// Assert
			expect(update).not.toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});

	describe("destroyAccount", () => {
		it("deletes the authenticated user", async () => {
			// Arrange
			const remove = jest.spyOn(User, "delete").mockResolvedValue({} as any);
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.destroyAccount(context);

			// Assert
			expect(remove).toHaveBeenCalledWith({ id: 1 });
			expect(result).toBe(true);
		});

		it("returns false when the request carries no payload", async () => {
			// Arrange
			const context = buildContext();

			// Act
			const result = await resolver.destroyAccount(context);

			// Assert
			expect(result).toBe(false);
		});

		it("throws when the delete fails", async () => {
			// Arrange
			jest.spyOn(User, "delete").mockRejectedValue(new Error("db down"));
			const context = buildContext({ payload: { userId: "1" } });

			// Act & Assert
			await expect(resolver.destroyAccount(context)).rejects.toThrow(
				ErrorMessages.DELETE_ACCOUNT
			);
		});

		it("returns true when the user no longer exists", async () => {
			// Arrange
			userFindOne.mockResolvedValue(undefined);
			const remove = jest.spyOn(User, "delete");
			const context = buildContext({ payload: { userId: "1" } });

			// Act
			const result = await resolver.destroyAccount(context);

			// Assert
			expect(remove).not.toHaveBeenCalled();
			expect(result).toBe(true);
		});
	});
});
