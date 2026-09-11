import { Response } from "express";
import { sendRefreshToken } from "./sendRefreshToken";

describe("sendRefreshToken", () => {
	it("sets an http only cookie scoped to the refresh token path", () => {
		// Arrange
		const res = { cookie: jest.fn().mockReturnThis() } as unknown as Response;

		// Act
		const result = sendRefreshToken(res, "a-refresh-token");

		// Assert
		expect(res.cookie).toHaveBeenCalledWith("jid", "a-refresh-token", {
			httpOnly: true,
			path: "/refresh_token",
		});
		expect(result).toBe(res);
	});

	it("clears the cookie when an empty token is sent", () => {
		// Arrange
		const res = { cookie: jest.fn().mockReturnThis() } as unknown as Response;

		// Act
		sendRefreshToken(res, "");

		// Assert
		expect(res.cookie).toHaveBeenCalledWith("jid", "", {
			httpOnly: true,
			path: "/refresh_token",
		});
	});
});
