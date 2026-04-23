import { SuccessMessages, ErrorMessages } from "./messages";

describe("SuccessMessages", () => {
	it("has ADD_MONEY as a string", () => {
		expect(typeof SuccessMessages.ADD_MONEY).toBe("string");
		expect(SuccessMessages.ADD_MONEY).toBe("Successfully topped up your account.");
	});

	it("has EXCHANGE as a string", () => {
		expect(typeof SuccessMessages.EXCHANGE).toBe("string");
		expect(SuccessMessages.EXCHANGE).toBe("The exchange was successfully executed.");
	});
});

describe("ErrorMessages", () => {
	it("has ADD_MONEY as a string", () => {
		expect(typeof ErrorMessages.ADD_MONEY).toBe("string");
		expect(ErrorMessages.ADD_MONEY).toBe("Failed to top up your account");
	});

	it("has EXCHANGE as a string", () => {
		expect(typeof ErrorMessages.EXCHANGE).toBe("string");
		expect(ErrorMessages.EXCHANGE).toBe("You do not have the sufficient funds to make this exchange.");
	});

	it("has LOGIN as a string", () => {
		expect(typeof ErrorMessages.LOGIN).toBe("string");
		expect(ErrorMessages.LOGIN).toBe("Invalid login.");
	});

	it("has PASSWORD as a string", () => {
		expect(typeof ErrorMessages.PASSWORD).toBe("string");
		expect(ErrorMessages.PASSWORD).toBe("Invalid password.");
	});

	it("has UPDATE_PASSWORD as a string", () => {
		expect(typeof ErrorMessages.UPDATE_PASSWORD).toBe("string");
		expect(ErrorMessages.UPDATE_PASSWORD).toBe(
			"Could not change your password, are you sure you entered the correct password?"
		);
	});

	it("has DELETE_ACCOUNT as a string", () => {
		expect(typeof ErrorMessages.DELETE_ACCOUNT).toBe("string");
		expect(ErrorMessages.DELETE_ACCOUNT).toBe("Failed to destroy account.");
	});

	it("has BALANCE_LESS_THAN as a string", () => {
		expect(typeof ErrorMessages.BALANCE_LESS_THAN).toBe("string");
		expect(ErrorMessages.BALANCE_LESS_THAN).toBe(
			"Your account balance has fallen below 0. Please top up before deleting."
		);
	});

	it("has BALANCE_GREATER_THAN as a string", () => {
		expect(typeof ErrorMessages.BALANCE_GREATER_THAN).toBe("string");
		expect(ErrorMessages.BALANCE_GREATER_THAN).toBe(
			"Your account balance is greater than 0. Please exchange your funds before deleting."
		);
	});
});
