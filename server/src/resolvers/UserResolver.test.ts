import * as typeorm from "typeorm";
import { getMetadataStorage } from "type-graphql/dist/metadata/getMetadataStorage";
import { UserResolver } from "./UserResolver";
import { User } from "../entity/User";
import { MyContext } from "../MyContext";
import { isAuth } from "../middleware";

const buildContext = (userId?: string): MyContext =>
	({
		req: { headers: {} },
		res: {},
		payload: userId === undefined ? undefined : { userId },
	} as unknown as MyContext);

describe("UserResolver", () => {
	const resolver = new UserResolver();

	describe("revokeRefreshTokensForUser", () => {
		let increment: jest.Mock;
		let getRepository: jest.Mock;

		beforeEach(() => {
			increment = jest.fn().mockResolvedValue(undefined);
			getRepository = jest.fn().mockReturnValue({ increment });
			jest.spyOn(typeorm, "getConnection").mockReturnValue(({ getRepository } as unknown) as typeorm.Connection);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("is guarded by the isAuth middleware", () => {
			// Arrange
			const metadata = getMetadataStorage().middlewares.filter(
				(middleware) =>
					middleware.target === UserResolver &&
					middleware.fieldName === "revokeRefreshTokensForUser"
			);

			// Act
			const middlewares = metadata.reduce<unknown[]>((all, middleware) => all.concat(middleware.middlewares), []);

			// Assert
			expect(middlewares).toContain(isAuth);
		});

		it("rejects calls without an access token before reaching the resolver", () => {
			// Arrange
			const next = jest.fn();

			// Act
			const call = () => isAuth({ context: buildContext() } as any, next);

			// Assert
			expect(call).toThrow("Not authenticated");
			expect(next).not.toHaveBeenCalled();
		});

		it("bumps the token version of the signed-in user", async () => {
			// Act
			const result = await resolver.revokeRefreshTokensForUser(2, buildContext("2"));

			// Assert
			expect(getRepository).toHaveBeenCalledWith(User);
			expect(increment).toHaveBeenCalledWith({ id: 2 }, "tokenVersion", 1);
			expect(result).toBe(true);
		});

		it("refuses to revoke another user's sessions", async () => {
			// Act
			const result = await resolver.revokeRefreshTokensForUser(3, buildContext("2"));

			// Assert
			expect(result).toBe(false);
			expect(increment).not.toHaveBeenCalled();
		});

		it("refuses when the request carries no payload", async () => {
			// Act
			const result = await resolver.revokeRefreshTokensForUser(2, buildContext());

			// Assert
			expect(result).toBe(false);
			expect(increment).not.toHaveBeenCalled();
		});
	});
});
