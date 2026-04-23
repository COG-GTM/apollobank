import React from 'react';
import { render, screen } from '@testing-library/react';
import { Account } from './Account';

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-svg" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-svg" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-svg" />,
}));

// Mock validation schema
jest.mock('../../schemas /addMoneyValidationSchema', () => ({
    addMoneyValidationSchema: {},
}));

// Mock Transactions component
jest.mock('./Transactions/Transactions', () => ({
    Transactions: (props: any) => <div data-testid="transactions-component" />,
}));

// Mock Dialog to render children when isOpen
jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

// Mock react-router-dom
const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: {
            currency: 'EUR',
            balance: 1000,
            iban: 'IE12BOFI90001234567890',
            bic: 'BOFIIE2D',
        },
    }),
    useHistory: () => ({
        push: mockHistoryPush,
        go: jest.fn(),
    }),
}));

// Mock generated graphql hooks
const mockCreateTransaction = jest.fn();
const mockAddMoney = jest.fn();
const mockExchange = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useCreateTransactionMutation: () => [mockCreateTransaction],
    useTransactionsQuery: () => ({
        data: {
            transactions: [
                {
                    id: '1',
                    amount: 50,
                    transactionType: 'payment',
                    date: '2023-01-01',
                    currency: 'EUR',
                },
            ],
        },
    }),
    useAddMoneyMutation: () => [mockAddMoney],
    useMeQuery: () => ({
        data: {
            me: {
                firstName: 'John',
                lastName: 'Doe',
            },
        },
    }),
    useAccountQuery: () => ({
        data: {
            account: {
                balance: 1000,
            },
        },
    }),
    useExchangeMutation: () => [mockExchange],
    useCardsQuery: () => ({
        data: {
            cards: [{ cardNumber: '4111111111111111' }],
        },
    }),
    useAccountsQuery: () => ({
        data: {
            accounts: [
                { id: '1', currency: 'EUR', balance: 1000 },
                { id: '2', currency: 'USD', balance: 500 },
            ],
        },
    }),
    useDeleteAccountMutation: () => [mockDeleteAccount],
    TransactionsDocument: {},
}));

describe('Account', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<Account />);
    });

    it('displays account balance', () => {
        render(<Account />);
        expect(screen.getByText(/€/)).toBeInTheDocument();
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    it('displays the currency full text for EUR', () => {
        render(<Account />);
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('renders the "Add money" button text', () => {
        render(<Account />);
        expect(screen.getByText('Add money')).toBeInTheDocument();
    });

    it('renders the "Exchange" button text', () => {
        render(<Account />);
        expect(screen.getByText('Exchange')).toBeInTheDocument();
    });

    it('renders the "Details" button text', () => {
        render(<Account />);
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders the "Simulate" button', () => {
        render(<Account />);
        expect(screen.getByText('Simulate')).toBeInTheDocument();
    });

    it('renders the Transactions component', () => {
        render(<Account />);
        expect(screen.getByTestId('transactions-component')).toBeInTheDocument();
    });

    it('displays the currency code EUR', () => {
        render(<Account />);
        expect(screen.getByText('EUR')).toBeInTheDocument();
    });
});
