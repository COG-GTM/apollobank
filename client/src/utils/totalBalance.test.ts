import { formatBalancesByCurrency } from './totalBalance';

describe('formatBalancesByCurrency', () => {
    it('shows each currency with its own symbol instead of converting to £', () => {
        // Arrange
        const accounts = [
            { currency: 'EUR', balance: 1090 },
            { currency: 'GBP', balance: 500 },
        ];

        // Act
        const total = formatBalancesByCurrency(accounts);

        // Assert
        expect(total).toBe('€1090 · £500');
    });

    it('sums accounts that share a currency', () => {
        // Arrange
        const accounts = [
            { currency: 'USD', balance: 18582 },
            { currency: 'EUR', balance: 10 },
            { currency: 'USD', balance: 20506 },
        ];

        // Act
        const total = formatBalancesByCurrency(accounts);

        // Assert
        expect(total).toBe('$39088 · €10');
    });

    it('falls back to the currency code for an unknown currency', () => {
        // Act
        const total = formatBalancesByCurrency([{ currency: 'CHF', balance: 7 }]);

        // Assert
        expect(total).toBe('7 CHF');
    });

    it('returns 0 when there are no accounts', () => {
        // Act
        const total = formatBalancesByCurrency([]);

        // Assert
        expect(total).toBe('0');
    });
});
