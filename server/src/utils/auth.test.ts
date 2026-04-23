import { createAccessToken, createRefreshToken } from "./auth";
import { sign } from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
	sign: jest.fn(() => "mocked-token"),
}));

const mockSign = sign as jest.Mock;

describe("createAccessToken", () => {
	beforeEach(() => {
		process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
		process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
		mockSign.mockClear();
	});

	it("calls sign with correct payload and options", () => {
		const user = { id: 1, tokenVersion: 0 } as any;
		const result = createAccessToken(user);

		expect(mockSign).toHaveBeenCalledWith(
			{ userId: 1 },
			"test-access-secret",
			{ expiresIn: "15m" }
		);
		expect(result).toBe("mocked-token");
	});
});

describe("createRefreshToken", () => {
	beforeEach(() => {
		process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
		process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
		mockSign.mockClear();
	});

	it("calls sign with correct payload including tokenVersion", () => {
		const user = { id: 1, tokenVersion: 3 } as any;
		const result = createRefreshToken(user);

		expect(mockSign).toHaveBeenCalledWith(
			{ userId: 1, tokenVersion: 3 },
			"test-refresh-secret",
			{ expiresIn: "7d" }
		);
		expect(result).toBe("mocked-token");
	});
});
