import React from 'react';
import { render } from '@testing-library/react';
import { Transactions } from './Transactions';

jest.mock('../styles/Account.style', () => ({
    useAccountStyles: () => ({
        root: 'root',
        transactions: 'transactions',
        transactionsHeader: 'transactionsHeader',
        transactionCards: 'transactionCards',
    }),
}));

describe('Transactions', () => {
    it('renders Loading when account is undefined', () => {
        const { container } = render(
            <Transactions account={undefined} cardNumber="1234" currencyIcon="£" />,
        );
        expect(container.querySelector('img[alt="Loading..."]')).toBeInTheDocument();
    });

    it('renders transaction cards when account has transactions', () => {
        const account = {
            transactions: [
                {
                    id: '1',
                    transactionType: 'payment',
                    date: '2021-01-01',
                    amount: 100,
                },
                {
                    id: '2',
                    transactionType: 'deposit',
                    date: '2021-01-02',
                    amount: 200,
                },
            ],
        };
        const { getByText } = render(
            <Transactions account={account as any} cardNumber="1234" currencyIcon="£" />,
        );
        expect(getByText('payment')).toBeInTheDocument();
        expect(getByText('deposit')).toBeInTheDocument();
    });

    it('renders with empty transactions', () => {
        const account = { transactions: [] };
        const { container } = render(
            <Transactions account={account as any} cardNumber="1234" currencyIcon="£" />,
        );
        expect(container).toBeDefined();
    });

    it('renders withdrawal and invoice transaction types', () => {
        const account = {
            transactions: [
                {
                    id: '3',
                    transactionType: 'withdrawal',
                    date: '2021-01-03',
                    amount: 50,
                },
                {
                    id: '4',
                    transactionType: 'invoice',
                    date: '2021-01-04',
                    amount: 75,
                },
            ],
        };
        const { getByText } = render(
            <Transactions account={account as any} cardNumber={undefined} currencyIcon="$" />,
        );
        expect(getByText('withdrawal')).toBeInTheDocument();
        expect(getByText('invoice')).toBeInTheDocument();
    });
});
