import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { refreshToken } from "./refreshToken";
import { createRefreshToken } from "./auth";
import { User } from "../entity/User";

const buildUser = (tokenVersion = 0): User => Object.assign(new User(), { id: 2, tokenVersion });

const buildRequest = (jid?: string): Request => ({ cookies: { jid } } as unknown as Request);

const buildResponse = () => {
	const res = { send: jest.fn(), cookie: jest.fn() };
	res.send.mockReturnValue(res);
	res.cookie.mockReturnValue(res);
	return res;
};

describe("refreshToken", () => {
	beforeEach(() => {
		jest.spyOn(console, "log").mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("issues a new access token and refresh cookie when the token version matches", async () => {
		// Arrange
		const user = buildUser(3);
		jest.spyOn(User, "findOne").mockResolvedValue(user);
		const res = buildResponse();

		// Act
		await refreshToken(buildRequest(createRefreshToken(user)), res as unknown as Response);

		// Assert
		const body = res.send.mock.calls[0][0];
		expect(body.ok).toBe(true);
		expect(verify(body.accessToken, process.env.ACCESS_TOKEN_SECRET!)).toMatchObject({ userId: 2 });
		expect(res.cookie).toHaveBeenCalledWith("jid", expect.any(String), expect.objectContaining({ httpOnly: true }));
	});

	it("rejects a refresh token whose version was revoked", async () => {
		// Arrange
		const revokedToken = createRefreshToken(buildUser(0));
		jest.spyOn(User, "findOne").mockResolvedValue(buildUser(1));
		const res = buildResponse();

		// Act
		await refreshToken(buildRequest(revokedToken), res as unknown as Response);

		// Assert
		expect(res.send).toHaveBeenCalledWith({ ok: false, accessToken: "" });
		expect(res.cookie).not.toHaveBeenCalled();
	});

	it("rejects a request without a refresh cookie", async () => {
		// Arrange
		const findOne = jest.spyOn(User, "findOne");
		const res = buildResponse();

		// Act
		await refreshToken(buildRequest(), res as unknown as Response);

		// Assert
		expect(res.send).toHaveBeenCalledWith({ ok: false, accessToken: "" });
		expect(findOne).not.toHaveBeenCalled();
	});

	it("rejects a refresh token with an invalid signature", async () => {
		// Arrange
		const findOne = jest.spyOn(User, "findOne");
		const res = buildResponse();

		// Act
		await refreshToken(buildRequest("not-a-jwt"), res as unknown as Response);

		// Assert
		expect(res.send).toHaveBeenCalledWith({ ok: false, accessToken: "" });
		expect(findOne).not.toHaveBeenCalled();
	});

	it("rejects a refresh token for a user that no longer exists", async () => {
		// Arrange
		jest.spyOn(User, "findOne").mockResolvedValue(undefined);
		const res = buildResponse();

		// Act
		await refreshToken(buildRequest(createRefreshToken(buildUser())), res as unknown as Response);

		// Assert
		expect(res.send).toHaveBeenCalledWith({ ok: false, accessToken: "" });
		expect(res.cookie).not.toHaveBeenCalled();
	});
});
