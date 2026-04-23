import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}));

const mockCreateAccount = jest.fn();
const mockCreateCard = jest.fn();

let mockAccountsData: any = {
    data: {
        accounts: [
            { id: 1, currency: 'EUR', balance: 1000, sortCode: '123456', iban: 'IE12APLO00990012345678', bic: 'APLBIE2D' },
            { id: 2, currency: 'USD', balance: 500, sortCode: '654321', iban: 'US12APLO00990012345678', bic: 'APLBUS2D' },
        ],
    },
    loading: false,
};

jest.mock('../../generated/graphql', () => ({
    useAccountsQuery: () => mockAccountsData,
    useCreateAccountMutation: () => [mockCreateAccount, {}],
    useCreateCardMutation: () => [mockCreateCard, {}],
    useCardsQuery: () => ({
        data: {
            cards: [
                { id: 1, cardNumber: '4111111111111111', pin: 1234, expiresIn: '2025-12-31', cvv: 123, monthlySpendingLimit: 5000 },
            ],
        },
    }),
    AccountsDocument: {},
    CardsDocument: {},
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Charts/Chart', () => ({
    Chart: ({ currency }: { currency: string }) => (
        <div data-testid="chart">Chart for {currency}</div>
    ),
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <span>{title}</span>,
}));

jest.mock('../../components/Cards/AccountsCard', () => ({
    AccountsCard: ({
        fullCurrencyText,
        currencyIcon,
        balance,
        onAccountClicked,
    }: {
        fullCurrencyText: string;
        currencyIcon: string;
        balance: number;
        iban: string;
        onAccountClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
    }) => (
        <div data-testid="accounts-card">
            <span>{fullCurrencyText}</span>
            <span>
                {currencyIcon}
                {balance}
            </span>
            <button onClick={onAccountClicked}>View</button>
        </div>
    ),
    NoAccountsCard: ({
        onCreateNewAccountClicked,
    }: {
        onCreateNewAccountClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
    }) => (
        <div data-testid="no-accounts-card">
            <button onClick={onCreateNewAccountClicked}>Create new account</button>
        </div>
    ),
}));

jest.mock('../../components/Cards/ApolloCard', () => ({
    ApolloCard: ({ cardNumber }: { cardNumber: string }) => (
        <div data-testid="apollo-card">{cardNumber}</div>
    ),
    NoApolloCard: ({
        onCreateNewCardClicked,
    }: {
        onCreateNewCardClicked: (e: React.MouseEvent<HTMLButtonElement>) => void;
    }) => (
        <div data-testid="no-apollo-card">
            <button onClick={onCreateNewCardClicked}>Create new card</button>
        </div>
    ),
}));

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

jest.mock('../../utils/theme', () => ({
    theme: {},
    ColorScheme: {
        PRIMARY: '#222B2D',
        SECONDARY: '#29AABB',
        ORANGE: '#F15742',
        MAROON: '#432D32',
        WHITE: '#FFFEF9',
        HOVER: '#148C9C',
        PRIMARY_HOVER: '#090c0c',
    },
}));

jest.mock('@material-ui/core', () => {
    const R = require('react');
    const Wrap = ({ children }: any) => R.createElement('div', null, children);
    return {
        __esModule: true,
        default: {},
        Container: Wrap,
        Grid: Wrap,
        Paper: Wrap,
        List: ({ children }: any) => R.createElement('ul', null, children),
        ListItem: ({ children, onClick }: any) => R.createElement('li', { onClick }, children),
        ListItemText: ({ primary }: any) => R.createElement('span', null, primary),
        ListItemIcon: ({ children }: any) => R.createElement('span', null, children),
        FormControl: Wrap,
        InputLabel: ({ children }: any) => R.createElement('label', null, children),
        Select: R.forwardRef(function MockSelect({ children, value, onChange }: any, ref: any) {
            return R.createElement('select', {
                'data-testid': 'analytics-select',
                value: value || '',
                onChange: (e: any) => onChange && onChange(e),
                ref,
            }, children);
        }),
        MenuItem: R.forwardRef(function MockMenuItem({ children, value }: any, ref: any) {
            return R.createElement('option', { value, ref }, children);
        }),
        ThemeProvider: Wrap,
        makeStyles: () => () => ({}),
        createMuiTheme: () => ({}),
    };
});

import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAccountsData = {
            data: {
                accounts: [
                    { id: 1, currency: 'EUR', balance: 1000, sortCode: '123456', iban: 'IE12APLO00990012345678', bic: 'APLBIE2D' },
                    { id: 2, currency: 'USD', balance: 500, sortCode: '654321', iban: 'US12APLO00990012345678', bic: 'APLBUS2D' },
                ],
            },
            loading: false,
        };
    });

    it('renders loading state when data is not available', () => {
        mockAccountsData = { data: undefined, loading: true };
        render(<Dashboard />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders the Analytics title', () => {
        render(<Dashboard />);
        expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('renders the Accounts title', () => {
        render(<Dashboard />);
        expect(screen.getByText('Accounts')).toBeInTheDocument();
    });

    it('renders the Cards title', () => {
        render(<Dashboard />);
        expect(screen.getByText('Cards')).toBeInTheDocument();
    });

    it('renders the chart component', () => {
        render(<Dashboard />);
        expect(screen.getByTestId('chart')).toBeInTheDocument();
    });

    it('renders account cards for each account', () => {
        render(<Dashboard />);
        const accountCards = screen.getAllByTestId('accounts-card');
        expect(accountCards).toHaveLength(2);
    });

    it('renders the total balance', () => {
        render(<Dashboard />);
        expect(screen.getByText(/Total balance/)).toBeInTheDocument();
    });

    it('renders the Apollo card', () => {
        render(<Dashboard />);
        expect(screen.getByTestId('apollo-card')).toBeInTheDocument();
        expect(screen.getByText('4111111111111111')).toBeInTheDocument();
    });

    it('renders the Create new account card when fewer than 3 accounts', () => {
        render(<Dashboard />);
        expect(screen.getByTestId('no-accounts-card')).toBeInTheDocument();
    });

    it('opens the dialog when Create new account is clicked', () => {
        render(<Dashboard />);
        const createButton = screen.getByTestId('no-accounts-card').querySelector('button');
        fireEvent.click(createButton!);
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('navigates to account page when an account card is clicked', () => {
        render(<Dashboard />);
        const viewButtons = screen.getAllByText('View');
        fireEvent.click(viewButtons[0]);
        expect(mockPush).toHaveBeenCalled();
    });
});
