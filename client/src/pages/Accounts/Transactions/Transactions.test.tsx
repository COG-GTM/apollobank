import React from 'react';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';
import { TransactionsQuery } from '../../../generated/graphql';

const makeAccount = (
    transactions: TransactionsQuery['transactions'],
): TransactionsQuery => ({ transactions });

describe('Transactions', () => {
    it('renders transactions newest first, whatever order they arrive in', () => {
        // Arrange
        const account = makeAccount([
            { id: 1, transactionType: 'deposit', date: '2026-11-01T10:00:00.000Z', amount: '10' },
            { id: 2, transactionType: 'invoice', date: '2026-11-20T10:00:00.000Z', amount: '20' },
            { id: 3, transactionType: 'payment', date: '2026-11-10T10:00:00.000Z', amount: '30' },
        ]);

        // Act
        render(<Transactions account={account} cardNumber="1234" />);

        // Assert
        const titles = screen
            .getAllByText(/^(deposit|invoice|payment)$/)
            .map((element) => element.textContent);
        expect(titles).toEqual(['invoice', 'payment', 'deposit']);
    });

    it('keeps the received order for transactions with the same date', () => {
        // Arrange
        const date = '2026-11-15T10:00:00.000Z';
        const account = makeAccount([
            { id: 5, transactionType: 'withdrawal', date, amount: '1' },
            { id: 4, transactionType: 'deposit', date, amount: '2' },
        ]);

        // Act
        render(<Transactions account={account} cardNumber="1234" />);

        // Assert
        const titles = screen
            .getAllByText(/^(withdrawal|deposit)$/)
            .map((element) => element.textContent);
        expect(titles).toEqual(['withdrawal', 'deposit']);
    });

    it('renders an account with no transactions without errors', () => {
        // Arrange
        const account = makeAccount([]);

        // Act
        const { container } = render(<Transactions account={account} cardNumber="1234" />);

        // Assert
        expect(container.querySelectorAll('.MuiCard-root')).toHaveLength(0);
    });
});
