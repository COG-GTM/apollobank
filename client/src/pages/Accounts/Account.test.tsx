import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Account } from './Account';

const mockPush = jest.fn();
const mockGo = jest.fn();

jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: {
            currency: 'EUR',
            balance: 1000,
            iban: 'IE12APLO00990012345678',
            bic: 'APLBIE2D',
        },
    }),
    useHistory: () => ({
        push: mockPush,
        go: mockGo,
    }),
}));

const mockCreateTransaction = jest.fn();
const mockAddMoney = jest.fn();
const mockExchange = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useCreateTransactionMutation: () => [mockCreateTransaction, {}],
    useAddMoneyMutation: () => [mockAddMoney, {}],
    useExchangeMutation: () => [mockExchange, {}],
    useDeleteAccountMutation: () => [mockDeleteAccount, {}],
    useMeQuery: () => ({
        data: {
            me: {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-01',
                streetAddress: '123 Main St',
                postCode: '12345',
                city: 'Dublin',
                country: 'Ireland',
            },
        },
    }),
    useAccountQuery: () => ({
        data: { account: { id: 1, balance: 1000 } },
    }),
    useAccountsQuery: () => ({
        data: {
            accounts: [
                { id: 1, currency: 'EUR', balance: 1000, sortCode: '123456', iban: 'IE12APLO00990012345678', bic: 'APLBIE2D' },
                { id: 2, currency: 'USD', balance: 500, sortCode: '654321', iban: 'US12APLO00990012345678', bic: 'APLBUS2D' },
            ],
        },
    }),
    useCardsQuery: () => ({
        data: {
            cards: [
                { id: 1, cardNumber: '4111111111111111', pin: 1234, expiresIn: '2025-12-31', cvv: 123, monthlySpendingLimit: 5000 },
            ],
        },
    }),
    useTransactionsQuery: () => ({
        data: {
            transactions: [
                { id: 1, transactionType: 'payment', date: '2021-06-15T12:00:00.000Z', amount: '50.00' },
                { id: 2, transactionType: 'deposit', date: '2021-06-16T12:00:00.000Z', amount: '200.00' },
            ],
        },
    }),
    TransactionsDocument: {},
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../components/Alerts/AlertMessage', () => ({
    SuccessMessage: ({ message }: { message: string }) => <div role="alert">{message}</div>,
    ErrorMessage: ({ message }: { message: string }) => <div role="alert">{message}</div>,
    WarningMessage: ({ message }: { message: string }) => <div role="alert">{message}</div>,
}));

jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ placeholder, name }: { placeholder: string; name: string }) => (
        <input placeholder={placeholder} name={name} />
    ),
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <span>{title}</span>,
}));

jest.mock('../../components/Cards/TransactionCard', () => ({
    TransactionCard: ({ title }: { title: string }) => <div data-testid="transaction-card">{title}</div>,
}));

jest.mock('./styles/Account.style', () => ({
    useAccountStyles: () => ({
        root: 'root',
        accountBalance: 'accountBalance',
        accountInfo: 'accountInfo',
        accountButtonsSection: 'accountButtonsSection',
        accountButton: 'accountButton',
        accountButtonText: 'accountButtonText',
        dialogButton: 'dialogButton',
        transactions: 'transactions',
        transactionsHeader: 'transactionsHeader',
        transactionCards: 'transactionCards',
    }),
}));

jest.mock('../../schemas /addMoneyValidationSchema', () => ({
    addMoneyValidationSchema: {},
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

describe('Account', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the account balance', () => {
        render(<Account />);
        expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    it('renders the currency full text for EUR', () => {
        render(<Account />);
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('renders the EUR currency label', () => {
        render(<Account />);
        expect(screen.getByText('EUR')).toBeInTheDocument();
    });

    it('renders the euro currency icon', () => {
        render(<Account />);
        expect(screen.getByText(/€/)).toBeInTheDocument();
    });

    it('renders the Simulate button', () => {
        render(<Account />);
        expect(screen.getByText('Simulate')).toBeInTheDocument();
    });

    it('renders the Add money button', () => {
        render(<Account />);
        expect(screen.getByText('Add money')).toBeInTheDocument();
    });

    it('renders the Exchange button', () => {
        render(<Account />);
        expect(screen.getByText('Exchange')).toBeInTheDocument();
    });

    it('renders the Details button', () => {
        render(<Account />);
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('opens the Add money dialog when Add button is clicked', () => {
        render(<Account />);
        const addButton = screen.getByLabelText('Add');
        fireEvent.click(addButton);
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens the Exchange dialog when Exchange button is clicked', () => {
        render(<Account />);
        const exchangeButton = screen.getByLabelText('Exchange');
        fireEvent.click(exchangeButton);
        const dialogs = screen.getAllByTestId('dialog');
        expect(dialogs.length).toBeGreaterThanOrEqual(1);
    });

    it('opens the Details dialog when Details button is clicked', () => {
        render(<Account />);
        const detailsButton = screen.getByLabelText('Details');
        fireEvent.click(detailsButton);
        const dialogs = screen.getAllByTestId('dialog');
        expect(dialogs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders transaction cards', () => {
        render(<Account />);
        const cards = screen.getAllByTestId('transaction-card');
        expect(cards).toHaveLength(2);
    });
});
