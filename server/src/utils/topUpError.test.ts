import { ApolloError } from "apollo-server-express";
import { ErrorMessages } from "./messages";
import { topUpError, TopUpErrorCodes } from "./topUpError";

describe("topUpError", () => {
	const originalFlag = process.env.TOP_UP_ERROR_CODES;

	afterEach(() => {
		if (originalFlag === undefined) {
			delete process.env.TOP_UP_ERROR_CODES;
		} else {
			process.env.TOP_UP_ERROR_CODES = originalFlag;
		}
	});

	it("returns a plain error with no code when the flag is off", () => {
		// Arrange
		delete process.env.TOP_UP_ERROR_CODES;

		// Act
		const error = topUpError(ErrorMessages.ADD_MONEY_INVALID_AMOUNT, TopUpErrorCodes.INVALID_AMOUNT);

		// Assert
		expect(error).not.toBeInstanceOf(ApolloError);
		expect(error.message).toBe(ErrorMessages.ADD_MONEY_INVALID_AMOUNT);
		expect((error as ApolloError).extensions).toBeUndefined();
	});

	it("adds the machine-readable code beside the same message when the flag is on", () => {
		// Arrange
		process.env.TOP_UP_ERROR_CODES = "true";

		// Act
		const error = topUpError(ErrorMessages.ADD_MONEY_NO_ACCOUNT, TopUpErrorCodes.ACCOUNT_NOT_FOUND);

		// Assert
		expect(error).toBeInstanceOf(ApolloError);
		expect(error.message).toBe(ErrorMessages.ADD_MONEY_NO_ACCOUNT);
		expect((error as ApolloError).extensions.code).toBe("TOP_UP_ACCOUNT_NOT_FOUND");
	});
});
