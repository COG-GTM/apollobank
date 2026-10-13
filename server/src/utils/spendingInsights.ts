import { Transaction } from "../entity/Transaction";

export const MONEY_IN_TYPES: string[] = ["deposit"];
export const MONEY_OUT_TYPES: string[] = ["withdrawal", "payment", "invoice"];

export const DEFAULT_DAYS = 30;
export const MIN_DAYS = 1;
export const MAX_DAYS = 365;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface SpendingCategoryShape {
	transactionType: string;
	total: number;
	count: number;
	share: number;
}

export interface DailySpendShape {
	date: string;
	moneyIn: number;
	moneyOut: number;
}

export interface SpendingInsightsShape {
	currency: string;
	totalIn: number;
	totalOut: number;
	net: number;
	largestTransaction: Transaction | null;
	changeVsPreviousPeriodPct: number | null;
	categories: SpendingCategoryShape[];
	daily: DailySpendShape[];
}

export interface InsightsWindow {
	days: number;
	/** Inclusive UTC start of the current window */
	start: Date;
	/** Exclusive UTC end of the current window (start of tomorrow) */
	end: Date;
	/** Inclusive UTC start of the previous equal-length window */
	previousStart: Date;
}

export const clampDays = (days: number | null | undefined): number => {
	if (typeof days !== "number" || !Number.isFinite(days)) {
		return DEFAULT_DAYS;
	}
	return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.floor(days)));
};

/**
 * UTC-day windows: the current window ends today (inclusive) and spans `days` days,
 * the previous window is the `days` days immediately before it.
 */
export const getInsightsWindow = (days: number | null | undefined, now: Date): InsightsWindow => {
	const clamped = clampDays(days);
	const todayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const start = todayStart - (clamped - 1) * DAY_MS;

	return {
		days: clamped,
		start: new Date(start),
		end: new Date(todayStart + DAY_MS),
		previousStart: new Date(start - clamped * DAY_MS),
	};
};

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const parseAmount = (amount: string): number => {
	const parsed = parseFloat(amount);
	return Number.isFinite(parsed) ? parsed : 0;
};

const toIsoDay = (time: number): string => new Date(time).toISOString().slice(0, 10);

/**
 * Pure aggregation of an account's transactions into the `SpendingInsights` contract shape.
 */
export const computeSpendingInsights = (
	transactions: Transaction[],
	currency: string,
	days: number | null | undefined,
	now: Date
): SpendingInsightsShape => {
	const window = getInsightsWindow(days, now);
	const start = window.start.getTime();
	const end = window.end.getTime();
	const previousStart = window.previousStart.getTime();

	const daily: DailySpendShape[] = [];
	const dailyByDate = new Map<string, DailySpendShape>();
	for (let time = start; time < end; time += DAY_MS) {
		const day: DailySpendShape = { date: toIsoDay(time), moneyIn: 0, moneyOut: 0 };
		daily.push(day);
		dailyByDate.set(day.date, day);
	}

	const categoryTotals = new Map<string, { total: number; count: number }>();
	let totalIn = 0;
	let totalOut = 0;
	let previousTotalOut = 0;
	let largestTransaction: Transaction | null = null;
	let largestAmount = -Infinity;

	for (const transaction of transactions) {
		const time = new Date(transaction.date).getTime();
		if (!Number.isFinite(time) || time < previousStart || time >= end) {
			continue;
		}

		const amount = parseAmount(transaction.amount);
		const isIn = MONEY_IN_TYPES.includes(transaction.transactionType);
		const isOut = MONEY_OUT_TYPES.includes(transaction.transactionType);

		if (time < start) {
			if (isOut) {
				previousTotalOut += amount;
			}
			continue;
		}

		if (amount > largestAmount) {
			largestAmount = amount;
			largestTransaction = transaction;
		}

		const day = dailyByDate.get(toIsoDay(time))!;
		if (isIn) {
			totalIn += amount;
			day.moneyIn += amount;
		} else if (isOut) {
			totalOut += amount;
			day.moneyOut += amount;
			const category = categoryTotals.get(transaction.transactionType) || { total: 0, count: 0 };
			category.total += amount;
			category.count += 1;
			categoryTotals.set(transaction.transactionType, category);
		}
	}

	const categories: SpendingCategoryShape[] = Array.from(categoryTotals.entries())
		.map(([transactionType, { total, count }]) => ({
			transactionType,
			total: roundMoney(total),
			count,
			share: totalOut > 0 ? total / totalOut : 0,
		}))
		.sort((a, b) => b.total - a.total || a.transactionType.localeCompare(b.transactionType));

	for (const day of daily) {
		day.moneyIn = roundMoney(day.moneyIn);
		day.moneyOut = roundMoney(day.moneyOut);
	}

	const changeVsPreviousPeriodPct =
		previousTotalOut > 0
			? Math.round(((totalOut - previousTotalOut) / previousTotalOut) * 10000) / 100
			: null;

	return {
		currency,
		totalIn: roundMoney(totalIn),
		totalOut: roundMoney(totalOut),
		net: roundMoney(totalIn - totalOut),
		largestTransaction,
		changeVsPreviousPeriodPct,
		categories,
		daily,
	};
};
