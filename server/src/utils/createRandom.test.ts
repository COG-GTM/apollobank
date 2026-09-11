import {
	createRandomNumber,
	createRandomIbanCode,
	createRandomBicCode,
	createRandomSortCode,
	createRandomCardNumber,
} from "./createRandom";

describe("createRandomNumber", () => {
	it("returns a numeric string of the requested length", () => {
		// Arrange
		const length = 4;

		// Act
		const result = createRandomNumber(length);

		// Assert
		expect(result).toMatch(/^[0-9]{4}$/);
	});

	it("returns a single digit when asked for one digit", () => {
		// Arrange & Act
		const result = createRandomNumber(1);

		// Assert
		expect(result).toMatch(/^[0-9]$/);
	});

	it("recurses and still returns the requested length when it exceeds the 11 digit maximum", () => {
		// Arrange
		const length = 15;

		// Act
		const result = createRandomNumber(length);

		// Assert
		expect(result).toMatch(/^[0-9]{15}$/);
	});
});

describe("createRandomIbanCode", () => {
	it("returns an IBAN in the GB AP0L format", () => {
		// Arrange & Act
		const result = createRandomIbanCode();

		// Assert
		expect(result).toMatch(/^GB[0-9]{2} AP0L [0-9]{4} [0-9]{4} [0-9]{4} [0-9]{2}$/);
	});
});

describe("createRandomBicCode", () => {
	it("returns a BIC prefixed with AP0LGB", () => {
		// Arrange & Act
		const result = createRandomBicCode();

		// Assert
		expect(result).toMatch(/^AP0LGB[0-9]{2}$/);
	});
});

describe("createRandomSortCode", () => {
	it("returns six digits grouped into three hyphen separated pairs", () => {
		// Arrange & Act
		const result = createRandomSortCode();

		// Assert
		expect(result).toMatch(/^[0-9]{2}-[0-9]{2}-[0-9]{2}$/);
	});

	it("returns undefined when the digits cannot be matched into pairs", () => {
		// Arrange
		const matchSpy = jest.spyOn(String.prototype, "match").mockReturnValue(null);

		// Act
		const result = createRandomSortCode();

		// Assert
		expect(result).toBeUndefined();
		matchSpy.mockRestore();
	});
});

describe("createRandomCardNumber", () => {
	it("returns sixteen digits in four space separated groups", () => {
		// Arrange & Act
		const result = createRandomCardNumber();

		// Assert
		expect(result).toMatch(/^[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}$/);
	});
});
