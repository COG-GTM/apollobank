import { formatCardExpiry } from './formatCardExpiry';

describe('formatCardExpiry', () => {
    it.each([
        ['January', new Date(2028, 0, 15), '01/28'],
        ['October', new Date(2023, 9, 1), '10/23'],
        ['December', new Date(2030, 11, 31), '12/30'],
    ])('formats a card expiring in %s as MM/YY', (_label, expiry, expected) => {
        // Arrange
        const expiresIn = expiry.toISOString();

        // Act
        const result = formatCardExpiry(expiresIn);

        // Assert
        expect(result).toBe(expected);
    });

    it('accepts the timestamp string the cards query returns', () => {
        // Arrange
        const expiresIn = new Date(2028, 0, 15, 12).toString();

        // Act
        const result = formatCardExpiry(expiresIn);

        // Assert
        expect(result).toBe('01/28');
    });
});
