/**
 * Static FX rates used for currency exchanges between a user's own accounts
 */
const RATES: Record<string, Record<string, number>> = {
	EUR: { USD: 1.11, GBP: 0.89 },
	USD: { EUR: 0.9, GBP: 0.8 },
	GBP: { USD: 1.25, EUR: 1.13 },
};

/**
 * Converts an amount from one currency to another using the static rates above.
 * Returns 0 when the currency pair is not supported.
 * @param amount
 * @param from
 * @param to
 */
export const convert = (amount: number, from: string, to: string): number => {
	const rate: number | undefined = RATES[from] && RATES[from][to];

	if (!rate) {
		return 0;
	}

	return amount * rate;
};
