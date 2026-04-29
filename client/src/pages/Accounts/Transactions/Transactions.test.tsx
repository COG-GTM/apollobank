import React from 'react';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';
import { TransactionsQuery } from '../../../generated/graphql';

jest.mock('../../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../../components/Cards/TransactionCard', () => ({
    TransactionCard: ({
        title,
        amount,
        currencyIcon,
    }: {
        title: string;
        amount: string;
        currencyIcon?: string;
    }) => (
        <div data-testid="transaction-card">
            <span>{title}</span>
            <span>
                {currencyIcon}
                {amount}
            </span>
        </div>
    ),
}));

jest.mock('../styles/Account.style', () => ({
    useAccountStyles: () => ({
        transactions: 'transactions',
        transactionsHeader: 'transactionsHeader',
        transactionCards: 'transactionCards',
    }),
}));

const mockTransactionsData: TransactionsQuery = {
    transactions: [
        {
            __typename: 'Transaction',
            id: 1,
            transactionType: 'payment',
            date: '2021-06-15T12:00:00.000Z',
            amount: '50.00',
        },
        {
            __typename: 'Transaction',
            id: 2,
            transactionType: 'deposit',
            date: '2021-06-16T12:00:00.000Z',
            amount: '200.00',
        },
        {
            __typename: 'Transaction',
            id: 3,
            transactionType: 'withdrawal',
            date: '2021-06-17T12:00:00.000Z',
            amount: '75.00',
        },
        {
            __typename: 'Transaction',
            id: 4,
            transactionType: 'invoice',
            date: '2021-06-18T12:00:00.000Z',
            amount: '120.00',
        },
    ],
};

describe('Transactions', () => {
    it('renders loading when account data is undefined', () => {
        render(
            <Transactions account={undefined} cardNumber="1234" currencyIcon="$" />,
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders transaction cards when data is provided', () => {
        render(
            <Transactions
                account={mockTransactionsData}
                cardNumber="1234-5678-9012-3456"
                currencyIcon="$"
            />,
        );
        const cards = screen.getAllByTestId('transaction-card');
        expect(cards).toHaveLength(4);
    });

    it('renders correct transaction types', () => {
        render(
            <Transactions
                account={mockTransactionsData}
                cardNumber="1234"
                currencyIcon="€"
            />,
        );
        expect(screen.getByText('payment')).toBeInTheDocument();
        expect(screen.getByText('deposit')).toBeInTheDocument();
        expect(screen.getByText('withdrawal')).toBeInTheDocument();
        expect(screen.getByText('invoice')).toBeInTheDocument();
    });

    it('renders nothing when transactions array is empty', () => {
        const emptyData: TransactionsQuery = { transactions: [] };
        render(
            <Transactions account={emptyData} cardNumber="1234" currencyIcon="$" />,
        );
        expect(screen.queryAllByTestId('transaction-card')).toHaveLength(0);
    });

    it('passes currency icon to transaction cards', () => {
        render(
            <Transactions
                account={mockTransactionsData}
                cardNumber="1234"
                currencyIcon="£"
            />,
        );
        expect(screen.getByText('£50.00')).toBeInTheDocument();
        expect(screen.getByText('£200.00')).toBeInTheDocument();
    });
});
