import { isAuth } from "./middleware";
import { verify } from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
	verify: jest.fn(),
}));

const mockVerify = verify as jest.Mock;

describe("isAuth middleware", () => {
	beforeEach(() => {
		process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
		mockVerify.mockClear();
	});

	it("throws 'Not authenticated' when no authorization header", () => {
		const context = {
			req: { headers: {} },
			res: {},
		};
		const next = jest.fn();

		expect(() => {
			(isAuth as any)({ context }, next);
		}).toThrow("Not authenticated");
		expect(next).not.toHaveBeenCalled();
	});

	it("throws 'Not authenticated' when verify fails", () => {
		const context = {
			req: { headers: { authorization: "Bearer invalid-token" } },
			res: {},
		};
		const next = jest.fn();
		mockVerify.mockImplementation(() => {
			throw new Error("invalid token");
		});

		expect(() => {
			(isAuth as any)({ context }, next);
		}).toThrow("Not authenticated");
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next() and sets payload when valid token", () => {
		const decodedPayload = { userId: "123" };
		const context = {
			req: { headers: { authorization: "Bearer valid-token" } },
			res: {},
		} as any;
		const next = jest.fn().mockReturnValue(undefined);
		mockVerify.mockReturnValue(decodedPayload);

		(isAuth as any)({ context }, next);

		expect(mockVerify).toHaveBeenCalledWith("valid-token", "test-access-secret");
		expect(context.payload).toEqual(decodedPayload);
		expect(next).toHaveBeenCalled();
	});
});
