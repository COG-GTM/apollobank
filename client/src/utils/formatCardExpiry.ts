// Formats a card's expiry date as MM/YY. Date#getMonth() is 0-based, so January is 0.
export const formatCardExpiry = (expiresIn: string): string => {
    const date = new Date(Date.parse(expiresIn));
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
};
