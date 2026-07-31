import React from 'react';
import { render, screen } from '@testing-library/react';
import { Transactions } from './Transactions';
import { TransactionsQuery, Transaction } from '../../../generated/graphql';

jest.mock('../styles/Account.style', () => ({
    useAccountStyles: () => ({}),
}));

jest.mock('../../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../../components/Cards/TransactionCard', () => ({
    TransactionCard: (props: {
        title: string;
        amount: string;
        time: string;
        card?: string;
        currencyIcon?: string;
    }) => (
        <div data-testid="transaction-card">
            <span data-testid="card-title">{props.title}</span>
            <span data-testid="card-amount">{props.amount}</span>
            <span data-testid="card-time">{props.time}</span>
            <span data-testid="card-card">{props.card}</span>
            <span data-testid="card-currency">{props.currencyIcon}</span>
        </div>
    ),
}));

const makeTransaction = (
    overrides: Partial<Transaction> = {}
): Transaction => ({
    __typename: 'Transaction',
    id: 1,
    transactionType: 'payment',
    date: '2023-06-15T12:00:00.000Z',
    amount: '50.00',
    ...overrides,
});

const makeAccount = (transactions: Transaction[]): TransactionsQuery => ({
    __typename: 'Query',
    transactions,
});

describe('Transactions', () => {
    it('shows Loading component when account prop is undefined', () => {
        render(
            <Transactions account={undefined} cardNumber="1234" />,
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('transaction-card')).not.toBeInTheDocument();
    });

    it('renders TransactionCard for each transaction when account data is provided', () => {
        const account = makeAccount([
            makeTransaction({ id: 1, transactionType: 'payment' }),
            makeTransaction({ id: 2, transactionType: 'deposit' }),
            makeTransaction({ id: 3, transactionType: 'withdrawal' }),
        ]);

        render(
            <Transactions account={account} cardNumber="4444" />,
        );

        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getAllByTestId('transaction-card')).toHaveLength(3);
    });

    it('passes correct props to TransactionCard', () => {
        const account = makeAccount([
            makeTransaction({
                id: 10,
                transactionType: 'invoice',
                date: '2024-01-20T08:30:00.000Z',
                amount: '123.45',
            }),
        ]);

        render(
            <Transactions
                account={account}
                cardNumber="9999-0000"
                currencyIcon="$"
            />,
        );

        expect(screen.getByTestId('card-title')).toHaveTextContent('invoice');
        expect(screen.getByTestId('card-amount')).toHaveTextContent('123.45');
        expect(screen.getByTestId('card-card')).toHaveTextContent('9999-0000');
        expect(screen.getByTestId('card-currency')).toHaveTextContent('$');

        const expectedDate = new Date(
            Date.parse('2024-01-20T08:30:00.000Z'),
        ).toLocaleDateString();
        expect(screen.getByTestId('card-time')).toHaveTextContent(expectedDate);
    });

    it('handles empty transactions array (no TransactionCards rendered)', () => {
        const account = makeAccount([]);

        render(
            <Transactions account={account} cardNumber="5555" />,
        );

        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('transaction-card')).not.toBeInTheDocument();
    });

    it('renders correct number of TransactionCards for multiple transactions', () => {
        const transactions = [
            makeTransaction({ id: 1, transactionType: 'payment', amount: '10.00' }),
            makeTransaction({ id: 2, transactionType: 'deposit', amount: '20.00' }),
            makeTransaction({ id: 3, transactionType: 'withdrawal', amount: '30.00' }),
            makeTransaction({ id: 4, transactionType: 'invoice', amount: '40.00' }),
            makeTransaction({ id: 5, transactionType: 'payment', amount: '50.00' }),
        ];
        const account = makeAccount(transactions);

        render(
            <Transactions account={account} cardNumber="1111" currencyIcon="EUR" />,
        );

        const cards = screen.getAllByTestId('transaction-card');
        expect(cards).toHaveLength(5);

        const titles = screen.getAllByTestId('card-title');
        expect(titles[0]).toHaveTextContent('payment');
        expect(titles[1]).toHaveTextContent('deposit');
        expect(titles[2]).toHaveTextContent('withdrawal');
        expect(titles[3]).toHaveTextContent('invoice');
        expect(titles[4]).toHaveTextContent('payment');
    });
});
