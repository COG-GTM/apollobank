export interface RouteAccount {
    id?: number;
    currency: string;
    balance: number;
    iban?: string;
    bic?: string;
}

// Clicking through from the dashboard passes the account in history state; a direct
// visit or reload only has the `:id` route param, so look it up in the accounts query.
export const accountFromRoute = (
    state: Partial<RouteAccount> | undefined,
    accounts: RouteAccount[] | undefined,
    id: string,
): RouteAccount | undefined => {
    if (state && state.currency) {
        return state as RouteAccount;
    }
    return accounts?.find((account) => String(account.id) === id);
};
