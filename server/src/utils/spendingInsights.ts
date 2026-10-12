import type { Transaction } from "../entity/Transaction";

export const MIN_INSIGHTS_DAYS = 1;
export const MAX_INSIGHTS_DAYS = 365;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONEY_IN_TYPES: ReadonlySet<string> = new Set(["deposit"]);
const MONEY_OUT_TYPES: ReadonlySet<string> = new Set(["withdrawal", "payment", "invoice"]);

export type InsightsTransaction = Pick<Transaction, "transactionType" | "amount"> & {
	date: Date | string;
};

export interface SpendingCategoryResult {
	transactionType: string;
	total: number;
	count: number;
	share: number;
}

export interface DailySpendResult {
	date: string;
	moneyIn: number;
	moneyOut: number;
}

export interface SpendingInsightsResult<T extends InsightsTransaction> {
	currency: string;
	totalIn: number;
	totalOut: number;
	net: number;
	largestTransaction: T | null;
	changeVsPreviousPeriodPct: number | null;
	categories: SpendingCategoryResult[];
	daily: DailySpendResult[];
}

export interface InsightsWindow {
	days: number;
	start: Date;
	end: Date;
	previousStart: Date;
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const startOfUtcDay = (date: Date): Date =>
	new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const clampInsightsDays = (days: number): number => {
	if (!Number.isFinite(days)) {
		return MIN_INSIGHTS_DAYS;
	}
	return Math.min(MAX_INSIGHTS_DAYS, Math.max(MIN_INSIGHTS_DAYS, Math.floor(days)));
};

/**
 * Current window = the last `days` UTC calendar days ending today (inclusive).
 * Previous window = the `days` days immediately before it.
 * `end` is exclusive (start of tomorrow, UTC).
 */
export const getInsightsWindow = (days: number, now: Date = new Date()): InsightsWindow => {
	const clampedDays = clampInsightsDays(days);
	const today = startOfUtcDay(now);
	const end = new Date(today.getTime() + MS_PER_DAY);
	const start = new Date(end.getTime() - clampedDays * MS_PER_DAY);
	const previousStart = new Date(start.getTime() - clampedDays * MS_PER_DAY);

	return { days: clampedDays, start, end, previousStart };
};

/**
 * Aggregates raw account transactions into the SpendingInsights contract shape.
 * Pure: no DB access; pass `now` for deterministic results.
 */
export const aggregateSpendingInsights = <T extends InsightsTransaction>(
	transactions: T[],
	currency: string,
	days: number,
	now: Date = new Date()
): SpendingInsightsResult<T> => {
	const window = getInsightsWindow(days, now);
	const startMs = window.start.getTime();
	const endMs = window.end.getTime();
	const previousStartMs = window.previousStart.getTime();

	const daily = new Map<string, { moneyIn: number; moneyOut: number }>();
	for (let i = 0; i < window.days; i++) {
		daily.set(toIsoDate(new Date(startMs + i * MS_PER_DAY)), { moneyIn: 0, moneyOut: 0 });
	}

	const categories = new Map<string, { total: number; count: number }>();
	let totalIn = 0;
	let totalOut = 0;
	let previousTotalOut = 0;
	let largestTransaction: T | null = null;
	let largestAbsAmount = -Infinity;

	for (const transaction of transactions) {
		const amount = parseFloat(transaction.amount);
		const time = new Date(transaction.date).getTime();
		if (Number.isNaN(amount) || Number.isNaN(time)) {
			continue;
		}

		const isMoneyIn = MONEY_IN_TYPES.has(transaction.transactionType);
		const isMoneyOut = MONEY_OUT_TYPES.has(transaction.transactionType);

		if (time >= previousStartMs && time < startMs) {
			if (isMoneyOut) {
				previousTotalOut += amount;
			}
			continue;
		}

		if (time < startMs || time >= endMs) {
			continue;
		}

		if (Math.abs(amount) > largestAbsAmount) {
			largestAbsAmount = Math.abs(amount);
			largestTransaction = transaction;
		}

		const day = daily.get(toIsoDate(new Date(time)));

		if (isMoneyIn) {
			totalIn += amount;
			if (day) day.moneyIn += amount;
		} else if (isMoneyOut) {
			totalOut += amount;
			if (day) day.moneyOut += amount;

			const category = categories.get(transaction.transactionType) || { total: 0, count: 0 };
			category.total += amount;
			category.count += 1;
			categories.set(transaction.transactionType, category);
		}
	}

	return {
		currency,
		totalIn: roundMoney(totalIn),
		totalOut: roundMoney(totalOut),
		net: roundMoney(totalIn - totalOut),
		largestTransaction,
		changeVsPreviousPeriodPct:
			previousTotalOut === 0
				? null
				: roundMoney(((totalOut - previousTotalOut) / previousTotalOut) * 100),
		categories: Array.from(categories.entries())
			.map(([transactionType, { total, count }]) => ({
				transactionType,
				total: roundMoney(total),
				count,
				share: totalOut === 0 ? 0 : total / totalOut,
			}))
			.sort((a, b) => b.total - a.total),
		daily: Array.from(daily.entries()).map(([date, { moneyIn, moneyOut }]) => ({
			date,
			moneyIn: roundMoney(moneyIn),
			moneyOut: roundMoney(moneyOut),
		})),
	};
};
