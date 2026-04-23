import React from 'react';
import { render, screen } from '@testing-library/react';
import { Account } from './Account';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-svg" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-svg" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-svg" />,
}));

jest.mock('../../generated/graphql', () => ({
    useCreateTransactionMutation: jest.fn(),
    useTransactionsQuery: jest.fn(),
    useAddMoneyMutation: jest.fn(),
    useMeQuery: jest.fn(),
    useAccountQuery: jest.fn(),
    useExchangeMutation: jest.fn(),
    useCardsQuery: jest.fn(),
    useAccountsQuery: jest.fn(),
    useDeleteAccountMutation: jest.fn(),
    TransactionsDocument: {},
}));

const mockLocationState = {
    id: 1,
    currency: 'EUR',
    balance: 1000,
    sortCode: '12-34-56',
    iban: 'IE12 APLO 0099 1234',
    bic: 'APLBIE2D',
};

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({ state: mockLocationState }),
    useHistory: () => ({ push: jest.fn(), go: jest.fn() }),
}));

import {
    useCreateTransactionMutation,
    useTransactionsQuery,
    useAddMoneyMutation,
    useMeQuery,
    useAccountQuery,
    useExchangeMutation,
    useCardsQuery,
    useAccountsQuery,
    useDeleteAccountMutation,
} from '../../generated/graphql';

const mockUseCreateTransactionMutation = useCreateTransactionMutation as jest.Mock;
const mockUseTransactionsQuery = useTransactionsQuery as jest.Mock;
const mockUseAddMoneyMutation = useAddMoneyMutation as jest.Mock;
const mockUseMeQuery = useMeQuery as jest.Mock;
const mockUseAccountQuery = useAccountQuery as jest.Mock;
const mockUseExchangeMutation = useExchangeMutation as jest.Mock;
const mockUseCardsQuery = useCardsQuery as jest.Mock;
const mockUseAccountsQuery = useAccountsQuery as jest.Mock;
const mockUseDeleteAccountMutation = useDeleteAccountMutation as jest.Mock;

const renderAccount = () => {
    return render(
        <MemoryRouter>
            <Account />
        </MemoryRouter>,
    );
};

describe('Account', () => {
    beforeEach(() => {
        mockUseCreateTransactionMutation.mockReturnValue([jest.fn()]);
        mockUseAddMoneyMutation.mockReturnValue([jest.fn()]);
        mockUseExchangeMutation.mockReturnValue([jest.fn()]);
        mockUseDeleteAccountMutation.mockReturnValue([jest.fn()]);
        mockUseMeQuery.mockReturnValue({
            data: { me: { id: 1, firstName: 'John', lastName: 'Doe' } },
        });
        mockUseAccountQuery.mockReturnValue({
            data: { account: { id: 1, balance: 1000 } },
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [{ id: 1, cardNumber: '1234 5678 9012 3456' }] },
        });
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: 1, currency: 'EUR', balance: 1000 },
                    { id: 2, currency: 'USD', balance: 500 },
                ],
            },
        });
        mockUseTransactionsQuery.mockReturnValue({
            data: {
                transactions: [
                    { id: 1, transactionType: 'payment', date: '2021-01-15T00:00:00Z', amount: '100' },
                ],
            },
        });
    });

    it('should render the account balance', () => {
        renderAccount();
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    it('should render the currency full text', () => {
        renderAccount();
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('should render the currency icon', () => {
        renderAccount();
        expect(screen.getByText(/€/)).toBeInTheDocument();
    });

    it('should render the Simulate button', () => {
        renderAccount();
        expect(screen.getByText('Simulate')).toBeInTheDocument();
    });

    it('should render Add money, Exchange, and Details buttons', () => {
        renderAccount();
        expect(screen.getByText('Add money')).toBeInTheDocument();
        expect(screen.getByText('Exchange')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should render transaction cards', () => {
        renderAccount();
        expect(screen.getByText('payment')).toBeInTheDocument();
    });
});
