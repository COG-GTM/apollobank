import { Transaction } from "../entity/Transaction";
import { clampDays, computeSpendingInsights, getInsightsWindow } from "./spendingInsights";

const NOW = new Date("2026-10-13T15:30:00.000Z");

const tx = (id: number, transactionType: string, amount: string, date: string): Transaction =>
	({ id, transactionType, amount, date: new Date(date) } as Transaction);

describe("clampDays", () => {
	it("clamps to the 1-365 range and floors fractional days", () => {
		expect(clampDays(0)).toBe(1);
		expect(clampDays(-5)).toBe(1);
		expect(clampDays(1000)).toBe(365);
		expect(clampDays(7.9)).toBe(7);
	});

	it("falls back to 30 days for missing or non-finite input", () => {
		expect(clampDays(undefined)).toBe(30);
		expect(clampDays(null)).toBe(30);
		expect(clampDays(NaN)).toBe(30);
	});
});

describe("getInsightsWindow", () => {
	it("builds UTC-day windows ending today inclusive", () => {
		const window = getInsightsWindow(7, NOW);

		expect(window.days).toBe(7);
		expect(window.start.toISOString()).toBe("2026-10-07T00:00:00.000Z");
		expect(window.end.toISOString()).toBe("2026-10-14T00:00:00.000Z");
		expect(window.previousStart.toISOString()).toBe("2026-09-30T00:00:00.000Z");
	});
});

describe("computeSpendingInsights", () => {
	it("zero-fills one daily entry per day in the window, oldest first", () => {
		const result = computeSpendingInsights([], "GBP", 7, NOW);

		expect(result.daily).toEqual([
			{ date: "2026-10-07", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-08", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-09", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-10", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-11", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-12", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-13", moneyIn: 0, moneyOut: 0 },
		]);
	});

	it("returns zero totals and no categories for an empty account", () => {
		const result = computeSpendingInsights([], "EUR", 30, NOW);

		expect(result).toMatchObject({
			currency: "EUR",
			totalIn: 0,
			totalOut: 0,
			net: 0,
			largestTransaction: null,
			changeVsPreviousPeriodPct: null,
			categories: [],
		});
		expect(result.daily).toHaveLength(30);
	});

	it("maps deposit to money in and withdrawal/payment/invoice to money out, ignoring other types", () => {
		const transactions = [
			tx(1, "deposit", "500", "2026-10-13T09:00:00Z"),
			tx(2, "withdrawal", "100.50", "2026-10-13T10:00:00Z"),
			tx(3, "payment", "40", "2026-10-12T10:00:00Z"),
			tx(4, "invoice", "9.50", "2026-10-12T11:00:00Z"),
			tx(5, "transfer", "999", "2026-10-11T10:00:00Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 3, NOW);

		expect(result.totalIn).toBe(500);
		expect(result.totalOut).toBe(150);
		expect(result.net).toBe(350);
		expect(result.daily).toEqual([
			{ date: "2026-10-11", moneyIn: 0, moneyOut: 0 },
			{ date: "2026-10-12", moneyIn: 0, moneyOut: 49.5 },
			{ date: "2026-10-13", moneyIn: 500, moneyOut: 100.5 },
		]);
		expect(result.categories.map((c) => c.transactionType)).toEqual(["withdrawal", "payment", "invoice"]);
		expect(result.categories.find((c) => c.transactionType === "transfer")).toBeUndefined();
	});

	it("computes category shares of totalOut that sum to 1", () => {
		const transactions = [
			tx(1, "withdrawal", "10", "2026-10-13T01:00:00Z"),
			tx(2, "withdrawal", "20", "2026-10-12T01:00:00Z"),
			tx(3, "payment", "30", "2026-10-11T01:00:00Z"),
			tx(4, "invoice", "30", "2026-10-10T01:00:00Z"),
			tx(5, "deposit", "1000", "2026-10-10T02:00:00Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 30, NOW);
		const shareSum = result.categories.reduce((sum, c) => sum + c.share, 0);

		expect(shareSum).toBeCloseTo(1, 10);
		expect(result.categories).toEqual([
			{ transactionType: "invoice", total: 30, count: 1, share: 30 / 90 },
			{ transactionType: "payment", total: 30, count: 1, share: 30 / 90 },
			{ transactionType: "withdrawal", total: 30, count: 2, share: 30 / 90 },
		]);
	});

	it("picks the largest-amount transaction in the current window only", () => {
		const transactions = [
			tx(1, "payment", "75", "2026-10-13T01:00:00Z"),
			tx(2, "transfer", "80", "2026-10-12T01:00:00Z"),
			tx(3, "deposit", "5000", "2026-10-01T01:00:00Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 7, NOW);

		expect(result.largestTransaction).toBe(transactions[1]);
	});

	it("returns null changeVsPreviousPeriodPct when the previous window has no money out", () => {
		const transactions = [
			tx(1, "payment", "50", "2026-10-13T01:00:00Z"),
			tx(2, "deposit", "500", "2026-10-02T01:00:00Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 7, NOW);

		expect(result.changeVsPreviousPeriodPct).toBeNull();
	});

	it("compares totalOut with the previous equal-length window", () => {
		const transactions = [
			tx(1, "payment", "150", "2026-10-13T01:00:00Z"),
			tx(2, "withdrawal", "100", "2026-10-06T23:59:59Z"),
			tx(3, "invoice", "20", "2026-09-30T00:00:00Z"),
			tx(4, "invoice", "999", "2026-09-29T23:59:59Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 7, NOW);

		expect(result.totalOut).toBe(150);
		expect(result.changeVsPreviousPeriodPct).toBe(25);
	});

	it("ignores future-dated, invalid-date and unparseable-amount transactions", () => {
		const transactions = [
			tx(1, "payment", "40", "2026-10-14T00:00:00Z"),
			tx(2, "payment", "40", "not-a-date"),
			tx(3, "payment", "abc", "2026-10-13T01:00:00Z"),
			tx(4, "payment", "12.345", "2026-10-13T02:00:00Z"),
		];

		const result = computeSpendingInsights(transactions, "GBP", 1, NOW);

		expect(result.daily).toEqual([{ date: "2026-10-13", moneyIn: 0, moneyOut: 12.35 }]);
		expect(result.totalOut).toBe(12.35);
		expect(result.categories).toEqual([{ transactionType: "payment", total: 12.35, count: 2, share: 1 }]);
		expect(result.largestTransaction).toBe(transactions[3]);
	});

	it("reports a zero share rather than NaN when all money out is zero", () => {
		const transactions = [tx(1, "payment", "0", "2026-10-13T01:00:00Z")];

		const result = computeSpendingInsights(transactions, "GBP", 1, NOW);

		expect(result.categories).toEqual([{ transactionType: "payment", total: 0, count: 1, share: 0 }]);
	});
});
