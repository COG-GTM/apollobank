import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Account } from './Account';

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-svg">Euro SVG</div>,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-svg">Dollar SVG</div>,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-svg">Pound SVG</div>,
}));

// Mock styles
jest.mock('./styles/Account.style', () => ({
    useAccountStyles: () => ({}),
}));

// Mock validation schema (note space in path)
jest.mock('../../schemas /addMoneyValidationSchema', () => ({
    addMoneyValidationSchema: {},
}));

// Mock graphql/execution/execute
jest.mock('graphql/execution/execute', () => ({
    ExecutionResultDataDefault: {},
}));

// Mock Dialog to render children when isOpen is true
jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

// Mock FormTextField
jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: (props: any) => <input data-testid={`form-field-${props.name}`} {...props} />,
}));

// Mock Title
jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <div data-testid="title">{title}</div>,
}));

// Mock Loading
jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

// Mock AlertMessage components
jest.mock('../../components/Alerts/AlertMessage', () => ({
    ErrorMessage: ({ message }: { message: string }) => (
        <div data-testid="error-message">{message}</div>
    ),
    SuccessMessage: ({ message }: { message: string }) => (
        <div data-testid="success-message">{message}</div>
    ),
    WarningMessage: ({ message }: { message: string }) => (
        <div data-testid="warning-message">{message}</div>
    ),
}));

// Mock Transactions component
jest.mock('./Transactions/Transactions', () => ({
    Transactions: (props: any) => <div data-testid="transactions">Transactions Component</div>,
}));

// Mock react-router-dom
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: {
            currency: 'EUR',
            balance: 1000,
            iban: 'IE12APLO00990011223344',
            bic: 'APLOJE22',
            id: '1',
        },
    }),
    useHistory: () => ({
        push: mockPush,
        go: jest.fn(),
    }),
}));

// Mock all GraphQL hooks
const mockCreateTransaction = jest.fn();
const mockAddMoney = jest.fn();
const mockExchange = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useCreateTransactionMutation: () => [mockCreateTransaction],
    useTransactionsQuery: () => ({
        data: {
            transactions: [],
        },
    }),
    useAddMoneyMutation: () => [mockAddMoney],
    useMeQuery: () => ({
        data: {
            me: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
            },
        },
    }),
    useAccountQuery: () => ({
        data: {
            account: {
                balance: 1000,
                currency: 'EUR',
            },
        },
    }),
    useExchangeMutation: () => [mockExchange],
    useAccountsQuery: () => ({
        data: {
            accounts: [
                { id: '1', currency: 'EUR', balance: 1000 },
                { id: '2', currency: 'USD', balance: 500 },
            ],
        },
    }),
    useCardsQuery: () => ({
        data: {
            cards: [],
        },
    }),
    useDeleteAccountMutation: () => [mockDeleteAccount],
    TransactionsDocument: {},
}));

describe('Account Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the account balance with correct currency icon (€1000 for EUR)', () => {
        render(<Account />);
        expect(screen.getByText(/€/)).toBeInTheDocument();
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    it('renders currency full text ("Euro" for EUR)', () => {
        render(<Account />);
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('renders "Add money", "Exchange", and "Details" buttons', () => {
        render(<Account />);
        expect(screen.getByText('Add money')).toBeInTheDocument();
        expect(screen.getByText('Exchange')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders the "Simulate" button', () => {
        render(<Account />);
        expect(screen.getByText('Simulate')).toBeInTheDocument();
    });

    it('renders the Transactions sub-component', () => {
        render(<Account />);
        expect(screen.getByTestId('transactions')).toBeInTheDocument();
    });

    it('shows error message when Simulate is clicked without a card', () => {
        render(<Account />);
        const simulateButton = screen.getByText('Simulate');
        fireEvent.click(simulateButton);
        expect(screen.getByTestId('error-message')).toHaveTextContent(
            "Can't make this transaction. Please register a card first.",
        );
    });
});
