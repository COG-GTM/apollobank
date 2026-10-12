import {
	aggregateSpendingInsights,
	clampInsightsDays,
	getInsightsWindow,
	InsightsTransaction,
} from "./spendingInsights";

const NOW = new Date("2026-10-12T15:30:00.000Z");

const tx = (
	transactionType: string,
	amount: string,
	date: string,
	extra: Record<string, unknown> = {}
): InsightsTransaction & Record<string, unknown> => ({
	transactionType,
	amount,
	date: new Date(date),
	...extra,
});

describe("aggregateSpendingInsights", () => {
	describe("daily zero-fill", () => {
		it("returns one zero-filled YYYY-MM-DD entry per day, oldest first, ending today", () => {
			// Arrange
			const days = 7;

			// Act
			const result = aggregateSpendingInsights([], "GBP", days, NOW);

			// Assert
			expect(result.daily).toHaveLength(days);
			expect(result.daily.map((d) => d.date)).toEqual([
				"2026-10-06",
				"2026-10-07",
				"2026-10-08",
				"2026-10-09",
				"2026-10-10",
				"2026-10-11",
				"2026-10-12",
			]);
			result.daily.forEach((d) => {
				expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(d.moneyIn).toBe(0);
				expect(d.moneyOut).toBe(0);
			});
		});

		it("defaults to 30 entries for a 30-day window spanning a month boundary", () => {
			// Arrange & Act
			const result = aggregateSpendingInsights([], "GBP", 30, NOW);

			// Assert
			expect(result.daily).toHaveLength(30);
			expect(result.daily[0].date).toBe("2026-09-13");
			expect(result.daily[29].date).toBe("2026-10-12");
		});

		it("places transactions into the bucket for their UTC day", () => {
			// Arrange
			const transactions = [
				tx("deposit", "100", "2026-10-10T08:00:00.000Z"),
				tx("payment", "40", "2026-10-10T23:59:59.000Z"),
				tx("withdrawal", "10", "2026-10-12T00:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 3, NOW);

			// Assert
			expect(result.daily).toEqual([
				{ date: "2026-10-10", moneyIn: 100, moneyOut: 40 },
				{ date: "2026-10-11", moneyIn: 0, moneyOut: 0 },
				{ date: "2026-10-12", moneyIn: 0, moneyOut: 10 },
			]);
		});
	});

	describe("window filtering", () => {
		it("excludes transactions older than the window and includes today", () => {
			// Arrange
			const transactions = [
				tx("payment", "999", "2026-10-05T23:59:59.999Z"),
				tx("payment", "10", "2026-10-06T00:00:00.000Z"),
				tx("payment", "20", "2026-10-12T15:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.totalOut).toBe(30);
			expect(result.categories[0].count).toBe(2);
		});

		it("excludes transactions dated after today", () => {
			// Arrange
			const transactions = [tx("payment", "50", "2026-10-13T00:00:00.000Z")];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.totalOut).toBe(0);
			expect(result.largestTransaction).toBeNull();
		});
	});

	describe("money in / money out mapping", () => {
		it("maps deposit to money in and withdrawal, payment, invoice to money out", () => {
			// Arrange
			const transactions = [
				tx("deposit", "500", "2026-10-12T09:00:00.000Z"),
				tx("withdrawal", "100", "2026-10-12T10:00:00.000Z"),
				tx("payment", "50", "2026-10-12T11:00:00.000Z"),
				tx("invoice", "25", "2026-10-12T12:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 1, NOW);

			// Assert
			expect(result.totalIn).toBe(500);
			expect(result.totalOut).toBe(175);
			expect(result.daily).toEqual([{ date: "2026-10-12", moneyIn: 500, moneyOut: 175 }]);
			expect(result.categories.map((c) => c.transactionType).sort()).toEqual([
				"invoice",
				"payment",
				"withdrawal",
			]);
		});

		it("parses string amounts, rounds money to 2 decimals and ignores NaN amounts", () => {
			// Arrange
			const transactions = [
				tx("deposit", "10.555", "2026-10-12T09:00:00.000Z"),
				tx("payment", "0.1", "2026-10-12T10:00:00.000Z"),
				tx("payment", "0.2", "2026-10-12T11:00:00.000Z"),
				tx("payment", "not-a-number", "2026-10-12T12:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 1, NOW);

			// Assert
			expect(result.totalIn).toBe(10.56);
			expect(result.totalOut).toBe(0.3);
			expect(result.categories).toEqual([
				{ transactionType: "payment", total: 0.3, count: 2, share: 1 },
			]);
		});
	});

	describe("totals and categories", () => {
		it("computes totals and net as totalIn minus totalOut", () => {
			// Arrange
			const transactions = [
				tx("deposit", "200", "2026-10-11T09:00:00.000Z"),
				tx("withdrawal", "350.5", "2026-10-12T09:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "EUR", 30, NOW);

			// Assert
			expect(result.currency).toBe("EUR");
			expect(result.totalIn).toBe(200);
			expect(result.totalOut).toBe(350.5);
			expect(result.net).toBe(-150.5);
		});

		it("excludes deposits from categories, sorts by total desc and shares sum to 1", () => {
			// Arrange
			const transactions = [
				tx("deposit", "1000", "2026-10-10T09:00:00.000Z"),
				tx("invoice", "10", "2026-10-10T10:00:00.000Z"),
				tx("withdrawal", "70", "2026-10-11T09:00:00.000Z"),
				tx("payment", "13.33", "2026-10-11T10:00:00.000Z"),
				tx("payment", "6.67", "2026-10-12T10:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 30, NOW);

			// Assert
			expect(result.categories.map((c) => c.transactionType)).toEqual([
				"withdrawal",
				"payment",
				"invoice",
			]);
			expect(result.categories.find((c) => c.transactionType === "deposit")).toBeUndefined();
			expect(result.categories[1]).toEqual({
				transactionType: "payment",
				total: 20,
				count: 2,
				share: 0.2,
			});
			const shareSum = result.categories.reduce((sum, c) => sum + c.share, 0);
			expect(Math.abs(shareSum - 1)).toBeLessThan(1e-9);
			result.categories.forEach((c) => {
				expect(c.share).toBeGreaterThanOrEqual(0);
				expect(c.share).toBeLessThanOrEqual(1);
			});
		});

		it("returns empty categories when there is only money in", () => {
			// Arrange
			const transactions = [tx("deposit", "100", "2026-10-12T09:00:00.000Z")];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 30, NOW);

			// Assert
			expect(result.categories).toEqual([]);
			expect(result.totalOut).toBe(0);
			expect(result.net).toBe(100);
		});
	});

	describe("empty account", () => {
		it("returns zeros, empty categories and null largestTransaction / change pct", () => {
			// Arrange & Act
			const result = aggregateSpendingInsights([], "USD", 30, NOW);

			// Assert
			expect(result).toMatchObject({
				currency: "USD",
				totalIn: 0,
				totalOut: 0,
				net: 0,
				largestTransaction: null,
				changeVsPreviousPeriodPct: null,
				categories: [],
			});
			expect(result.daily).toHaveLength(30);
		});
	});

	describe("changeVsPreviousPeriodPct", () => {
		it("returns the percent change of totalOut vs the preceding window", () => {
			// Arrange
			const transactions = [
				tx("payment", "100", "2026-10-01T09:00:00.000Z"),
				tx("deposit", "5000", "2026-10-02T09:00:00.000Z"),
				tx("payment", "150", "2026-10-10T09:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.changeVsPreviousPeriodPct).toBe(50);
			expect(result.totalOut).toBe(150);
		});

		it("returns a negative change when spending decreased", () => {
			// Arrange
			const transactions = [
				tx("withdrawal", "200", "2026-09-30T00:00:00.000Z"),
				tx("withdrawal", "50", "2026-10-12T00:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.changeVsPreviousPeriodPct).toBe(-75);
		});

		it("ignores transactions before the previous window", () => {
			// Arrange
			const transactions = [
				tx("payment", "100", "2026-09-28T23:59:59.999Z"),
				tx("payment", "40", "2026-10-12T09:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.changeVsPreviousPeriodPct).toBeNull();
		});

		it("returns null when the previous period's totalOut is 0", () => {
			// Arrange
			const transactions = [
				tx("deposit", "300", "2026-10-01T09:00:00.000Z"),
				tx("payment", "80", "2026-10-12T09:00:00.000Z"),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 7, NOW);

			// Assert
			expect(result.changeVsPreviousPeriodPct).toBeNull();
		});
	});

	describe("largestTransaction", () => {
		it("selects the in-window transaction with the largest absolute amount of any type", () => {
			// Arrange
			const biggest = tx("deposit", "900", "2026-10-11T09:00:00.000Z", { id: 2 });
			const transactions = [
				tx("payment", "5000", "2026-09-01T09:00:00.000Z", { id: 1 }),
				biggest,
				tx("withdrawal", "899.99", "2026-10-12T09:00:00.000Z", { id: 3 }),
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 30, NOW);

			// Assert
			expect(result.largestTransaction).toBe(biggest);
		});

		it("compares by absolute amount", () => {
			// Arrange
			const negative = tx("withdrawal", "-250", "2026-10-11T09:00:00.000Z");
			const transactions = [tx("payment", "200", "2026-10-12T09:00:00.000Z"), negative];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 30, NOW);

			// Assert
			expect(result.largestTransaction).toBe(negative);
		});
	});

	describe("days handling", () => {
		it("accepts ISO string dates", () => {
			// Arrange
			const transactions = [
				{ transactionType: "payment", amount: "12", date: "2026-10-12T01:00:00.000Z" },
			];

			// Act
			const result = aggregateSpendingInsights(transactions, "GBP", 1, NOW);

			// Assert
			expect(result.totalOut).toBe(12);
		});

		it("clamps days to the 1–365 range", () => {
			// Arrange & Act & Assert
			expect(aggregateSpendingInsights([], "GBP", 0, NOW).daily).toHaveLength(1);
			expect(aggregateSpendingInsights([], "GBP", 1000, NOW).daily).toHaveLength(365);
			expect(clampInsightsDays(NaN)).toBe(1);
			expect(clampInsightsDays(7.9)).toBe(7);
		});
	});
});

describe("getInsightsWindow", () => {
	it("returns UTC day boundaries for the current and previous windows", () => {
		// Arrange & Act
		const window = getInsightsWindow(7, NOW);

		// Assert
		expect(window.days).toBe(7);
		expect(window.start.toISOString()).toBe("2026-10-06T00:00:00.000Z");
		expect(window.end.toISOString()).toBe("2026-10-13T00:00:00.000Z");
		expect(window.previousStart.toISOString()).toBe("2026-09-29T00:00:00.000Z");
	});
});
