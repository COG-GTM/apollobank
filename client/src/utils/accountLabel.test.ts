import { formatAccountLabel } from './accountLabel';

describe('formatAccountLabel', () => {
    it('labels two accounts in the same currency differently', () => {
        // Arrange
        const first = { currency: 'USD', iban: 'GB33 BUKB 2020 1555 5555 1234' };
        const second = { currency: 'USD', iban: 'GB94 BARC 1020 1530 0935 9876' };

        // Act
        const labels = [formatAccountLabel(first), formatAccountLabel(second)];

        // Assert
        expect(labels).toEqual(['USD ••1234', 'USD ••9876']);
    });

    it('falls back to the currency when there is no IBAN', () => {
        // Act
        const label = formatAccountLabel({ currency: 'EUR', iban: null });

        // Assert
        expect(label).toBe('EUR');
    });
});
