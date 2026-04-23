import {
	createRandomNumber,
	createRandomIbanCode,
	createRandomBicCode,
	createRandomSortCode,
	createRandomCardNumber,
} from "./createRandom";

describe("createRandomNumber", () => {
	it("returns a string of correct length for n=1", () => {
		const result = createRandomNumber(1);
		expect(typeof result).toBe("string");
		expect(result).toHaveLength(1);
	});

	it("returns a string of correct length for n=5", () => {
		const result = createRandomNumber(5);
		expect(result).toHaveLength(5);
	});

	it("returns a string of correct length for n=10", () => {
		const result = createRandomNumber(10);
		expect(result).toHaveLength(10);
	});

	it("returns a string of correct length for n=11 (max single call)", () => {
		const result = createRandomNumber(11);
		expect(result).toHaveLength(11);
	});

	it("handles n>11 via recursion", () => {
		const result = createRandomNumber(15);
		expect(result).toHaveLength(15);
	});

	it("handles n=12 via recursion", () => {
		const result = createRandomNumber(12);
		expect(result).toHaveLength(12);
	});

	it("returns only digit characters", () => {
		for (let n = 1; n <= 12; n++) {
			const result = createRandomNumber(n);
			expect(result).toMatch(/^\d+$/);
		}
	});
});

describe("createRandomIbanCode", () => {
	it("matches format GB## AP0L #### #### #### ##", () => {
		const result = createRandomIbanCode();
		expect(result).toMatch(/^GB\d{2} AP0L \d{4} \d{4} \d{4} \d{2}$/);
	});
});

describe("createRandomBicCode", () => {
	it("matches format AP0LGB##", () => {
		const result = createRandomBicCode();
		expect(result).toMatch(/^AP0LGB\d{2}$/);
	});
});

describe("createRandomSortCode", () => {
	it("matches format ##-##-##", () => {
		const result = createRandomSortCode();
		expect(result).toBeDefined();
		expect(result).toMatch(/^\d{2}-\d{2}-\d{2}$/);
	});
});

describe("createRandomCardNumber", () => {
	it("matches format #### #### #### ####", () => {
		const result = createRandomCardNumber();
		expect(result).toMatch(/^\d{4} \d{4} \d{4} \d{4}$/);
	});
});
