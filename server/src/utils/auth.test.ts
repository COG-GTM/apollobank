import { verify, decode } from "jsonwebtoken";
import { createAccessToken, createRefreshToken } from "./auth";
import { User } from "../entity/User";

const buildUser = (overrides: Partial<User> = {}): User =>
	Object.assign(new User(), { id: 7, tokenVersion: 2 }, overrides);

describe("createAccessToken", () => {
	it("signs the user id with the access token secret", () => {
		// Arrange
		const user = buildUser();

		// Act
		const token = createAccessToken(user);

		// Assert
		const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
			userId: number;
			exp: number;
			iat: number;
		};
		expect(payload.userId).toBe(7);
		expect(payload.exp - payload.iat).toBe(15 * 60);
	});

	it("produces a token that cannot be verified with the refresh token secret", () => {
		// Arrange
		const user = buildUser();

		// Act
		const token = createAccessToken(user);

		// Assert
		expect(() => verify(token, process.env.REFRESH_TOKEN_SECRET!)).toThrow();
	});
});

describe("createRefreshToken", () => {
	it("signs the user id and token version with the refresh token secret", () => {
		// Arrange
		const user = buildUser({ tokenVersion: 5 });

		// Act
		const token = createRefreshToken(user);

		// Assert
		const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
			userId: number;
			tokenVersion: number;
			exp: number;
			iat: number;
		};
		expect(payload).toMatchObject({ userId: 7, tokenVersion: 5 });
		expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
	});

	it("creates a token that is already expired when the clock is moved past its lifetime", () => {
		// Arrange
		const user = buildUser();
		const token = createRefreshToken(user);
		const { exp } = decode(token) as { exp: number };
		const dateSpy = jest.spyOn(Date, "now").mockReturnValue((exp + 1) * 1000);

		// Act & Assert
		expect(() => verify(token, process.env.REFRESH_TOKEN_SECRET!)).toThrow(/expired/);
		dateSpy.mockRestore();
	});
});
