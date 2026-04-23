import { sendRefreshToken } from "./sendRefreshToken";

describe("sendRefreshToken", () => {
	it("sets cookie with correct name, token, and options", () => {
		const mockRes = {
			cookie: jest.fn().mockReturnThis(),
		} as any;

		const token = "test-refresh-token";
		sendRefreshToken(mockRes, token);

		expect(mockRes.cookie).toHaveBeenCalledWith("jid", token, {
			httpOnly: true,
			path: "/refresh_token",
		});
	});
});
