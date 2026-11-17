export const formatAccountLabel = (account: { currency: string; iban?: string | null }): string => {
    const iban: string = (account.iban ?? '').replace(/\s/g, '');
    return iban.length >= 4 ? `${account.currency} ••${iban.slice(-4)}` : account.currency;
};
