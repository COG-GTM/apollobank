import { convertAmount, getExchangeRate } from "./exchangeRates";

describe("getExchangeRate", () => {
	it.each([
		["EUR", "USD", 1.11],
		["EUR", "GBP", 0.89],
		["USD", "EUR", 0.9],
		["USD", "GBP", 0.8],
		["GBP", "USD", 1.25],
		["GBP", "EUR", 1.13],
	])("returns the current rate for %s to %s", (from, to, expected) => {
		// Act
		const rate = getExchangeRate(from, to);

		// Assert
		expect(rate).toBe(expected);
	});

	it.each([
		["EUR", "EUR"],
		["USD", "USD"],
		["GBP", "GBP"],
	])("returns undefined for the same-currency pair %s to %s", (from, to) => {
		// Act
		const rate = getExchangeRate(from, to);

		// Assert
		expect(rate).toBeUndefined();
	});

	it.each([
		["JPY", "USD"],
		["EUR", "JPY"],
		["EUR", "constructor"],
		["toString", "EUR"],
	])("returns undefined for the unsupported pair %s to %s", (from, to) => {
		// Act
		const rate = getExchangeRate(from, to);

		// Assert
		expect(rate).toBeUndefined();
	});
});

describe("convertAmount", () => {
	it("converts and rounds to a whole unit", () => {
		// Arrange
		const amount = 100;

		// Act
		const converted = convertAmount(amount, "EUR", "USD");

		// Assert
		expect(converted).toBe(111);
	});

	it("rounds half values up the same way as Math.round", () => {
		// Arrange
		const amount = 2;

		// Act
		const converted = convertAmount(amount, "GBP", "USD");

		// Assert
		expect(converted).toBe(3);
	});

	it("returns undefined for an unsupported pair", () => {
		// Act
		const converted = convertAmount(100, "EUR", "EUR");

		// Assert
		expect(converted).toBeUndefined();
	});
});
