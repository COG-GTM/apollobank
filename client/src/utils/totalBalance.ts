const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };

export const formatBalancesByCurrency = (
    accounts: ReadonlyArray<{ currency: string; balance: number }>,
): string => {
    const totals = new Map<string, number>();
    accounts.forEach(({ currency, balance }) => {
        totals.set(currency, (totals.get(currency) ?? 0) + balance);
    });
    if (totals.size === 0) {
        return '0';
    }
    return Array.from(totals, ([currency, total]) => {
        const symbol: string | undefined = CURRENCY_SYMBOLS[currency];
        return symbol ? `${symbol}${total}` : `${total} ${currency}`;
    }).join(' · ');
};
