import React from 'react';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';
import { TransactionsQuery, Transaction } from '../../../generated/graphql';

jest.mock('../../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../../components/Cards/TransactionCard', () => ({
    TransactionCard: (props: {
        title: string;
        time: string;
        card?: string;
        amount: string;
        currencyIcon?: string;
        transactionIcon?: React.ReactNode;
    }) => (
        <div data-testid="transaction-card">
            <span data-testid="card-title">{props.title}</span>
            <span data-testid="card-time">{props.time}</span>
            <span data-testid="card-card">{props.card}</span>
            <span data-testid="card-amount">{props.amount}</span>
            <span data-testid="card-currency">{props.currencyIcon}</span>
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

const mockTransactions: TransactionsQuery = {
    transactions: [
        { id: 1, transactionType: 'payment', date: '2023-01-15T10:00:00Z', amount: '50.00' } as Transaction,
        { id: 2, transactionType: 'deposit', date: '2023-01-16T10:00:00Z', amount: '200.00' } as Transaction,
        { id: 3, transactionType: 'withdrawal', date: '2023-01-17T10:00:00Z', amount: '75.00' } as Transaction,
        { id: 4, transactionType: 'invoice', date: '2023-01-18T10:00:00Z', amount: '30.00' } as Transaction,
    ],
};

describe('Transactions', () => {
    it('renders Loading component when account prop is undefined', () => {
        render(
            <Transactions account={undefined} cardNumber="1234" />,
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('transaction-card')).not.toBeInTheDocument();
    });

    it('renders transaction cards when account data is provided', () => {
        render(
            <Transactions
                account={mockTransactions}
                cardNumber="1234-5678"
                currencyIcon="$"
            />,
        );
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('transaction-card')).toHaveLength(4);
    });

    it('renders correct number of transaction cards', () => {
        const twoTransactions: TransactionsQuery = {
            transactions: [
                { id: 1, transactionType: 'payment', date: '2023-01-15T10:00:00Z', amount: '50.00' } as Transaction,
                { id: 2, transactionType: 'deposit', date: '2023-01-16T10:00:00Z', amount: '200.00' } as Transaction,
            ],
        };
        render(
            <Transactions account={twoTransactions} cardNumber="1234" />,
        );
        expect(screen.getAllByTestId('transaction-card')).toHaveLength(2);
    });

    it('handles empty transactions array (renders no cards)', () => {
        const emptyTransactions: TransactionsQuery = {
            transactions: [],
        };
        render(
            <Transactions account={emptyTransactions} cardNumber="1234" />,
        );
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('transaction-card')).not.toBeInTheDocument();
    });

    it('passes correct props to TransactionCard components', () => {
        render(
            <Transactions
                account={mockTransactions}
                cardNumber="9999-0000"
                currencyIcon="$"
            />,
        );
        const titles = screen.getAllByTestId('card-title');
        expect(titles[0]).toHaveTextContent('payment');
        expect(titles[1]).toHaveTextContent('deposit');
        expect(titles[2]).toHaveTextContent('withdrawal');
        expect(titles[3]).toHaveTextContent('invoice');

        const amounts = screen.getAllByTestId('card-amount');
        expect(amounts[0]).toHaveTextContent('50.00');
        expect(amounts[1]).toHaveTextContent('200.00');
        expect(amounts[2]).toHaveTextContent('75.00');
        expect(amounts[3]).toHaveTextContent('30.00');

        const cards = screen.getAllByTestId('card-card');
        cards.forEach((card) => {
            expect(card).toHaveTextContent('9999-0000');
        });

        const currencies = screen.getAllByTestId('card-currency');
        currencies.forEach((currency) => {
            expect(currency).toHaveTextContent('$');
        });

        const times = screen.getAllByTestId('card-time');
        expect(times[0]).toHaveTextContent(
            new Date(Date.parse('2023-01-15T10:00:00Z')).toLocaleDateString(),
        );
    });
});
