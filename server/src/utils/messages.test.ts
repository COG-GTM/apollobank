import { SuccessMessages, ErrorMessages } from "./messages";

describe("SuccessMessages", () => {
	it("exposes user facing success copy for money movement", () => {
		// Arrange & Act & Assert
		expect(SuccessMessages.ADD_MONEY).toBe("Successfully topped up your account.");
		expect(SuccessMessages.EXCHANGE).toBe("The exchange was successfully executed.");
	});
});

describe("ErrorMessages", () => {
	it("exposes user facing error copy for every failure case", () => {
		// Arrange & Act & Assert
		expect(ErrorMessages.ADD_MONEY).toBe("Failed to top up your account");
		expect(ErrorMessages.EXCHANGE).toBe(
			"You do not have the sufficient funds to make this exchange."
		);
		expect(ErrorMessages.LOGIN).toBe("Invalid login.");
		expect(ErrorMessages.PASSWORD).toBe("Invalid password.");
		expect(ErrorMessages.UPDATE_PASSWORD).toBe(
			"Could not change your password, are you sure you entered the correct password?"
		);
		expect(ErrorMessages.DELETE_ACCOUNT).toBe("Failed to destroy account.");
		expect(ErrorMessages.BALANCE_LESS_THAN).toBe(
			"Your account balance has fallen below 0. Please top up before deleting."
		);
		expect(ErrorMessages.BALANCE_GREATER_THAN).toBe(
			"Your account balance is greater than 0. Please exchange your funds before deleting."
		);
	});
});
