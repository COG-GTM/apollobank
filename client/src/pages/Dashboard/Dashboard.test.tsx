import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
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
    useAccountsQuery: jest.fn(),
    useCreateAccountMutation: jest.fn(),
    useCreateCardMutation: jest.fn(),
    useCardsQuery: jest.fn(),
    AccountsDocument: {},
    CardsDocument: {},
}));

jest.mock('../../components/Charts/Chart', () => ({
    Chart: () => <div data-testid="chart">Chart</div>,
}));

import {
    useAccountsQuery,
    useCreateAccountMutation,
    useCreateCardMutation,
    useCardsQuery,
} from '../../generated/graphql';

const mockUseAccountsQuery = useAccountsQuery as jest.Mock;
const mockUseCreateAccountMutation = useCreateAccountMutation as jest.Mock;
const mockUseCreateCardMutation = useCreateCardMutation as jest.Mock;
const mockUseCardsQuery = useCardsQuery as jest.Mock;

const renderDashboard = () => {
    return render(
        <MemoryRouter>
            <Dashboard />
        </MemoryRouter>,
    );
};

describe('Dashboard', () => {
    beforeEach(() => {
        mockUseCreateAccountMutation.mockReturnValue([jest.fn()]);
        mockUseCreateCardMutation.mockReturnValue([jest.fn()]);
        mockUseCardsQuery.mockReturnValue({ data: { cards: [] } });
    });

    it('should show loading when data is not available', () => {
        mockUseAccountsQuery.mockReturnValue({ data: undefined, loading: true });
        renderDashboard();
        expect(screen.getByAltText('Loading...')).toBeInTheDocument();
    });

    it('should render Analytics and Accounts titles when data is available', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        renderDashboard();
        expect(screen.getByText('Analytics')).toBeInTheDocument();
        expect(screen.getByText('Accounts')).toBeInTheDocument();
        expect(screen.getByText('Cards')).toBeInTheDocument();
    });

    it('should render the total balance', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        renderDashboard();
        expect(screen.getByText(/Total balance/)).toBeInTheDocument();
    });

    it('should render the create new account button when accounts <= 2', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: 1, currency: 'EUR', balance: 1000, sortCode: '12-34-56', iban: 'IE123', bic: 'BIC1' },
                ],
            },
            loading: false,
        });
        renderDashboard();
        expect(screen.getByText('Create new account')).toBeInTheDocument();
    });

    it('should render account cards for existing accounts', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: 1, currency: 'EUR', balance: 1000, sortCode: '12-34-56', iban: 'IE123', bic: 'BIC1' },
                ],
            },
            loading: false,
        });
        renderDashboard();
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('should render the chart component', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        renderDashboard();
        expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
});
