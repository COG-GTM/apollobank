import React from 'react';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';

describe('Transactions', () => {
    it('should show loading when account data is undefined', () => {
        render(<Transactions account={undefined} cardNumber="1234" currencyIcon="€" />);
        expect(screen.getByAltText('Loading...')).toBeInTheDocument();
    });

    it('should render transaction cards when data is available', () => {
        const account = {
            transactions: [
                { id: 1, transactionType: 'payment', date: '2021-01-15T00:00:00Z', amount: '150.00' },
                { id: 2, transactionType: 'deposit', date: '2021-01-16T00:00:00Z', amount: '500.00' },
            ],
        };
        render(<Transactions account={account as any} cardNumber="1234 5678" currencyIcon="€" />);
        expect(screen.getByText('payment')).toBeInTheDocument();
        expect(screen.getByText('deposit')).toBeInTheDocument();
    });

    it('should render nothing when transactions array is empty', () => {
        const account = { transactions: [] };
        const { container } = render(
            <Transactions account={account as any} cardNumber="1234" currencyIcon="€" />,
        );
        expect(container.querySelector('.MuiCard-root')).not.toBeInTheDocument();
    });
});
