import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

// Mock @material-ui/core to avoid ThemeProvider/Select crashes in jsdom
jest.mock('@material-ui/core', () => {
    const actual = jest.requireActual('@material-ui/core');
    return {
        ...actual,
        ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Select: ({ children, value }: any) => <div data-testid="select">{children}</div>,
        InputLabel: ({ children }: any) => <label>{children}</label>,
        MenuItem: ({ children, value }: any) => <option value={value}>{children}</option>,
        FormControl: ({ children }: any) => <div>{children}</div>,
    };
});

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-icon">Euro</div>,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-icon">Dollar</div>,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-icon">Pound</div>,
}));

// Mock styles
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

// Mock child components
jest.mock('../../components/Charts/Chart', () => ({
    Chart: ({ currency }: { currency: string }) => (
        <div data-testid="chart">Chart: {currency}</div>
    ),
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Cards/AccountsCard', () => ({
    AccountsCard: ({
        balance,
        iban,
        fullCurrencyText,
    }: {
        balance: number;
        iban: string;
        fullCurrencyText: string;
    }) => (
        <div data-testid="accounts-card">
            {fullCurrencyText} - {balance} - {iban}
        </div>
    ),
    NoAccountsCard: ({
        onCreateNewAccountClicked,
    }: {
        onCreateNewAccountClicked: React.MouseEventHandler<HTMLButtonElement>;
    }) => <div data-testid="no-accounts-card">Create new account</div>,
}));

jest.mock('../../components/Cards/ApolloCard', () => ({
    ApolloCard: ({
        cardNumber,
        validThru,
        cvv,
    }: {
        cardNumber: string;
        validThru: string;
        cvv: string;
    }) => (
        <div data-testid="apollo-card">
            {cardNumber} - {validThru} - {cvv}
        </div>
    ),
    NoApolloCard: ({
        onCreateNewCardClicked,
    }: {
        onCreateNewCardClicked: React.MouseEventHandler<HTMLButtonElement>;
    }) => <div data-testid="no-apollo-card">Create new card</div>,
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title, fontSize }: { title: string; fontSize: number }) => (
        <div data-testid={`title-${title}`}>{title}</div>
    ),
}));

// Mock react-router-dom
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}));

// Mock utils/theme
jest.mock('../../utils/theme', () => ({
    theme: {},
}));

// Mock GraphQL hooks
const mockUseAccountsQuery = jest.fn();
const mockUseCardsQuery = jest.fn();
const mockCreateAccount = jest.fn();
const mockCreateCard = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useAccountsQuery: () => mockUseAccountsQuery(),
    useCardsQuery: () => mockUseCardsQuery(),
    useCreateAccountMutation: () => [mockCreateAccount],
    useCreateCardMutation: () => [mockCreateCard],
    AccountsDocument: {},
    CardsDocument: {},
}));

const mockAccount = (
    id: string,
    currency: string,
    balance: number,
) => ({
    id,
    currency,
    balance,
    iban: `IE12APLO0099001122${id}`,
    bic: 'APLOJE22',
});

const mockCard = (id: string) => ({
    id,
    cardNumber: '4111111111111111',
    expiresIn: '2025-12-31',
    cvv: '123',
});

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Loading component when data is not available', () => {
        mockUseAccountsQuery.mockReturnValue({ data: undefined, loading: true });
        mockUseCardsQuery.mockReturnValue({ data: undefined });

        render(<Dashboard />);

        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders Analytics, Accounts, and Cards section titles when data is loaded', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('title-Analytics')).toHaveTextContent('Analytics');
        expect(screen.getByTestId('title-Accounts')).toHaveTextContent('Accounts');
        expect(screen.getByTestId('title-Cards')).toHaveTextContent('Cards');
    });

    it('renders account cards when accounts exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    mockAccount('1', 'EUR', 1000),
                    mockAccount('2', 'USD', 2000),
                ],
            },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        const accountCards = screen.getAllByTestId('accounts-card');
        expect(accountCards).toHaveLength(2);
    });

    it('shows "Create new account" card when fewer than 3 accounts', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [mockAccount('1', 'EUR', 1000)],
            },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('no-accounts-card')).toBeInTheDocument();
    });

    it('does not show "Create new account" card when 3 accounts exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    mockAccount('1', 'EUR', 1000),
                    mockAccount('2', 'USD', 2000),
                    mockAccount('3', 'GBP', 3000),
                ],
            },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.queryByTestId('no-accounts-card')).not.toBeInTheDocument();
    });

    it('shows total balance text', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [mockAccount('1', 'GBP', 5000)],
            },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.getByText(/Total balance/)).toBeInTheDocument();
    });

    it('renders ApolloCard when cards exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [mockCard('1')] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('apollo-card')).toBeInTheDocument();
    });

    it('renders NoApolloCard when fewer than 3 cards exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [mockCard('1')] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('no-apollo-card')).toBeInTheDocument();
    });

    it('renders NoApolloCard when no cards exist', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('no-apollo-card')).toBeInTheDocument();
    });

    it('renders Chart component', () => {
        mockUseAccountsQuery.mockReturnValue({
            data: {
                accounts: [mockAccount('1', 'EUR', 1000)],
            },
            loading: false,
        });
        mockUseCardsQuery.mockReturnValue({
            data: { cards: [] },
        });

        render(<Dashboard />);

        expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
});
