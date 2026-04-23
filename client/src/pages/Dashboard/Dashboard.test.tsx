import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Dashboard } from './Dashboard';

jest.mock('./styles/Dashboard.style', () => ({
    useDashboardStyles: () => ({
        root: 'root',
        content: 'content',
        container: 'container',
        paper: 'paper',
        accountCardHeight: 'accountCardHeight',
        apolloCard: 'apolloCard',
        chart: 'chart',
    }),
}));

jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <svg data-testid="euro-svg" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <svg data-testid="dollar-svg" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <svg data-testid="pound-svg" />,
}));

const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({ push: mockPush }),
}));

jest.mock('../../components/Charts/Chart', () => ({
    Chart: ({ currency }: { currency: string }) => <div data-testid="chart">{currency}</div>,
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../../components/Cards/AccountsCard', () => ({
    AccountsCard: ({ balance, currencyIcon, onAccountClicked }: any) => (
        <button onClick={onAccountClicked} data-testid="accounts-card">
            {currencyIcon}{balance}
        </button>
    ),
    NoAccountsCard: ({ onCreateNewAccountClicked }: any) => (
        <button onClick={onCreateNewAccountClicked} data-testid="no-accounts-card">
            Create account
        </button>
    ),
}));

jest.mock('../../components/Cards/ApolloCard', () => ({
    ApolloCard: ({ cardNumber }: any) => <div data-testid="apollo-card">{cardNumber}</div>,
    NoApolloCard: ({ onCreateNewCardClicked }: any) => (
        <button onClick={onCreateNewCardClicked} data-testid="no-apollo-card">
            Create card
        </button>
    ),
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ isOpen, children }: any) => isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

const mockCreateAccount = jest.fn();
const mockCreateCard = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useAccountsQuery: jest.fn(),
    useCreateAccountMutation: () => [mockCreateAccount],
    useCreateCardMutation: () => [mockCreateCard],
    useCardsQuery: jest.fn(),
    AccountsDocument: {},
    CardsDocument: {},
}));

const { useAccountsQuery, useCardsQuery } = require('../../generated/graphql');

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useCardsQuery.mockReturnValue({ data: { cards: [] } });
    });

    it('renders loading when data is not available', () => {
        useAccountsQuery.mockReturnValue({ data: undefined, loading: true });
        const { getByTestId } = render(<Dashboard />);
        expect(getByTestId('loading')).toBeInTheDocument();
    });

    it('renders dashboard with accounts', () => {
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: '1', currency: 'GBP', balance: 1000, iban: 'GB123' },
                    { id: '2', currency: 'EUR', balance: 500, iban: 'EU456' },
                ],
            },
            loading: false,
        });
        const { getByText, getAllByTestId } = render(<Dashboard />);
        expect(getByText('Analytics')).toBeInTheDocument();
        expect(getByText('Accounts')).toBeInTheDocument();
        expect(getByText('Cards')).toBeInTheDocument();
        expect(getAllByTestId('accounts-card')).toHaveLength(2);
    });

    it('renders no accounts card when less than 3 accounts', () => {
        useAccountsQuery.mockReturnValue({
            data: { accounts: [{ id: '1', currency: 'GBP', balance: 1000, iban: 'GB123' }] },
            loading: false,
        });
        const { getByTestId } = render(<Dashboard />);
        expect(getByTestId('no-accounts-card')).toBeInTheDocument();
    });

    it('renders no apollo card when no cards exist', () => {
        useAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        useCardsQuery.mockReturnValue({ data: { cards: [] } });
        const { getByTestId } = render(<Dashboard />);
        expect(getByTestId('no-apollo-card')).toBeInTheDocument();
    });

    it('renders apollo cards when cards exist', () => {
        useAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        useCardsQuery.mockReturnValue({
            data: {
                cards: [
                    { id: '1', cardNumber: '1234567890123456', expiresIn: '2025-12-01', cvv: '123' },
                ],
            },
        });
        const { getByTestId } = render(<Dashboard />);
        expect(getByTestId('apollo-card')).toBeInTheDocument();
    });

    it('navigates to account page when account card is clicked', () => {
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [{ id: '1', currency: 'GBP', balance: 1000, iban: 'GB123' }],
            },
            loading: false,
        });
        const { getByTestId } = render(<Dashboard />);
        fireEvent.click(getByTestId('accounts-card'));
        expect(mockPush).toHaveBeenCalledWith({
            pathname: '/accounts/1',
            state: { id: '1', currency: 'GBP', balance: 1000, iban: 'GB123' },
        });
    });

    it('renders USD account with dollar icon', () => {
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [{ id: '1', currency: 'USD', balance: 500, iban: 'US123' }],
            },
            loading: false,
        });
        const { getByText } = render(<Dashboard />);
        expect(getByText('$500')).toBeInTheDocument();
    });

    it('calculates total balance with currency conversions', () => {
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: '1', currency: 'GBP', balance: 1000, iban: 'GB123' },
                    { id: '2', currency: 'EUR', balance: 1130, iban: 'EU456' },
                    { id: '3', currency: 'USD', balance: 1250, iban: 'US789' },
                ],
            },
            loading: false,
        });
        const { getByText } = render(<Dashboard />);
        expect(getByText(/Total balance/)).toBeInTheDocument();
    });
});
