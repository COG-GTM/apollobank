const EXCHANGE_RATES: Record<string, Record<string, number>> = {
	EUR: { USD: 1.11, GBP: 0.89 },
	USD: { EUR: 0.9, GBP: 0.8 },
	GBP: { USD: 1.25, EUR: 1.13 },
};

/**
 * Returns the rate for converting one unit of `from` into `to`,
 * or undefined when the pair is not supported (including same-currency pairs)
 */
export const getExchangeRate = (from: string, to: string): number | undefined => {
	const ratesFrom = Object.prototype.hasOwnProperty.call(EXCHANGE_RATES, from)
		? EXCHANGE_RATES[from]
		: undefined;

	return ratesFrom && Object.prototype.hasOwnProperty.call(ratesFrom, to) ? ratesFrom[to] : undefined;
};

/**
 * Converts `amount` from one currency to another, rounded to a whole unit,
 * or undefined when the pair is not supported
 */
export const convertAmount = (amount: number, from: string, to: string): number | undefined => {
	const rate = getExchangeRate(from, to);
	return rate === undefined ? undefined : Math.round(amount * rate);
};
