import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-icon" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-icon" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-icon" />,
}));

// Mock Chart component to avoid Recharts rendering issues
jest.mock('../../components/Charts/Chart', () => ({
    Chart: ({ currency }: { currency: string }) => (
        <div data-testid="mock-chart">Chart: {currency}</div>
    ),
}));

// Mock Loading component
jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock GraphQL hooks
jest.mock('../../generated/graphql', () => ({
    useAccountsQuery: jest.fn(),
    useCardsQuery: jest.fn(),
    useCreateAccountMutation: jest.fn(),
    useCreateCardMutation: jest.fn(),
    AccountsDocument: {},
    CardsDocument: {},
}));

import {
    useAccountsQuery,
    useCardsQuery,
    useCreateAccountMutation,
    useCreateCardMutation,
} from '../../generated/graphql';

const mockUseAccountsQuery = useAccountsQuery as jest.Mock;
const mockUseCardsQuery = useCardsQuery as jest.Mock;
const mockUseCreateAccountMutation = useCreateAccountMutation as unknown as jest.Mock;
const mockUseCreateCardMutation = useCreateCardMutation as unknown as jest.Mock;

const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}));

const mockAccounts = [
    { id: '1', currency: 'EUR', balance: 1000, iban: 'IE12BOFI90001234567890', bic: 'BOFIIE2D' },
    { id: '2', currency: 'USD', balance: 500, iban: 'IE12BOFI90001234567891', bic: 'BOFIIE2D' },
];

const mockCards = [
    { id: '1', cardNumber: '4111111111111111', expiresIn: '2025-12-01', cvv: '123' },
];

const renderDashboard = () =>
    render(
        <MemoryRouter>
            <Dashboard />
        </MemoryRouter>,
    );

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCreateAccountMutation.mockReturnValue([jest.fn()]);
        mockUseCreateCardMutation.mockReturnValue([jest.fn()]);
    });

    it('renders loading state when data is undefined', () => {
        mockUseAccountsQuery.mockReturnValue({ data: undefined, loading: true });
        mockUseCardsQuery.mockReturnValue({ data: undefined });

        renderDashboard();

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders the Analytics title when data is available', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('renders the Accounts title when data is available', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('Accounts')).toBeInTheDocument();
    });

    it('renders the Cards title when data is available', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('Cards')).toBeInTheDocument();
    });

    it('displays total balance', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        // EUR 1000 / 1.13 = 885 (rounded), USD 500 / 1.25 = 400 => total = 1285
        expect(screen.getByText(/Total balance:/)).toBeInTheDocument();
    });

    it('renders account cards for each account in the data', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('Euro')).toBeInTheDocument();
        expect(screen.getByText('US Dollar')).toBeInTheDocument();
    });

    it('renders the "No accounts" card when fewer than 3 accounts exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('Create new account')).toBeInTheDocument();
    });

    it('renders credit card components when cards data is available', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: mockAccounts },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({ data: { cards: mockCards } });

        renderDashboard();

        expect(screen.getByText('4111111111111111')).toBeInTheDocument();
    });
});
