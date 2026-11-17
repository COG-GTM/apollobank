import { getErrorMessage } from './errorMessage';

const BALANCE_GREATER_THAN =
    'Your account balance is greater than 0. Please exchange your funds before deleting.';

describe('getErrorMessage', () => {
    it('returns the whole server message when it has no prefix', () => {
        // Arrange
        const error = new Error(BALANCE_GREATER_THAN);

        // Act
        const message = getErrorMessage(error);

        // Assert
        expect(message).toBe(BALANCE_GREATER_THAN);
    });

    it('strips a "GraphQL error:" prefix', () => {
        // Arrange
        const error = new Error(`GraphQL error: ${BALANCE_GREATER_THAN}`);

        // Act
        const message = getErrorMessage(error);

        // Assert
        expect(message).toBe(BALANCE_GREATER_THAN);
    });

    it('returns an empty string for a non-Error value', () => {
        // Act
        const message = getErrorMessage(undefined);

        // Assert
        expect(message).toBe('');
    });
});
