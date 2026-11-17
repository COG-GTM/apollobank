// Formats a card's expiry date as MM/YY. Uses UTC so a browser west of the server doesn't
// show the previous month for a midnight-on-the-1st expiry; getUTCMonth() is 0-based.
export const formatCardExpiry = (expiresIn: string): string => {
    const date = new Date(Date.parse(expiresIn));
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = String(date.getUTCFullYear()).slice(-2);
    return `${month}/${year}`;
};
