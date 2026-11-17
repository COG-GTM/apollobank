import { formatCardExpiry } from './formatCardExpiry';

describe('formatCardExpiry', () => {
    it.each([
        ['January', '2028-01-15T12:00:00.000Z', '01/28'],
        ['October', '2023-10-15T12:00:00.000Z', '10/23'],
        ['December', '2030-12-15T12:00:00.000Z', '12/30'],
    ])('formats a card expiring in %s as MM/YY', (_label, expiresIn, expected) => {
        // Act
        const result = formatCardExpiry(expiresIn);

        // Assert
        expect(result).toBe(expected);
    });

    it('keeps the month of a midnight-on-the-1st UTC expiry in any browser timezone', () => {
        // Arrange
        const expiresIn = '2023-10-01T00:00:00.000Z';

        // Act
        const result = formatCardExpiry(expiresIn);

        // Assert
        expect(result).toBe('10/23');
    });

    it('keeps the year of a New Year midnight UTC expiry in any browser timezone', () => {
        // Arrange
        const expiresIn = '2028-01-01T00:00:00.000Z';

        // Act
        const result = formatCardExpiry(expiresIn);

        // Assert
        expect(result).toBe('01/28');
    });
});
