import { sign } from "jsonwebtoken";
import { isAuth } from "./middleware";
import { MyContext } from "./MyContext";

const buildContext = (authorization?: string): MyContext =>
	({
		req: { headers: authorization ? { authorization } : {} },
		res: {},
	} as unknown as MyContext);

const invokeIsAuth = (context: MyContext, next: () => Promise<unknown>) =>
	isAuth({ context, args: {}, root: {}, info: {} as any }, next);

describe("isAuth", () => {
	let consoleSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleSpy.mockRestore();
	});

	it("attaches the payload to the context and calls next for a valid bearer token", async () => {
		// Arrange
		const token = sign({ userId: 42 }, process.env.ACCESS_TOKEN_SECRET!);
		const context = buildContext(`bearer ${token}`);
		const next = jest.fn().mockResolvedValue("resolved");

		// Act
		const result = await invokeIsAuth(context, next);

		// Assert
		expect(context.payload).toMatchObject({ userId: 42 });
		expect(next).toHaveBeenCalledTimes(1);
		expect(result).toBe("resolved");
	});

	it("throws when the authorization header is missing", () => {
		// Arrange
		const context = buildContext();
		const next = jest.fn();

		// Act & Assert
		expect(() => invokeIsAuth(context, next)).toThrow("Not authenticated");
		expect(next).not.toHaveBeenCalled();
	});

	it("throws when the token was signed with a different secret", () => {
		// Arrange
		const token = sign({ userId: 42 }, "some-other-secret");
		const context = buildContext(`bearer ${token}`);
		const next = jest.fn();

		// Act & Assert
		expect(() => invokeIsAuth(context, next)).toThrow("Not authenticated");
		expect(next).not.toHaveBeenCalled();
	});

	it("throws when the token has expired", () => {
		// Arrange
		const token = sign({ userId: 42 }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: "-1s" });
		const context = buildContext(`bearer ${token}`);
		const next = jest.fn();

		// Act & Assert
		expect(() => invokeIsAuth(context, next)).toThrow("Not authenticated");
	});

	it("throws when the authorization header has no token after the scheme", () => {
		// Arrange
		const context = buildContext("bearer");
		const next = jest.fn();

		// Act & Assert
		expect(() => invokeIsAuth(context, next)).toThrow("Not authenticated");
	});
});
