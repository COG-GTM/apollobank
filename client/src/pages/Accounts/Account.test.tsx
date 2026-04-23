import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Account } from './Account';

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
const mockGo = jest.fn();
jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: { currency: 'GBP', balance: 1000, iban: 'GB123', bic: 'BIC123' },
    }),
    useHistory: () => ({ push: mockPush, go: mockGo }),
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ isOpen, children }: any) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ name, placeholder }: any) => (
        <input name={name} placeholder={placeholder} data-testid={`form-field-${name}`} />
    ),
}));

jest.mock('../../components/Alerts/AlertMessage', () => ({
    SuccessMessage: ({ message }: any) => <div data-testid="success-message">{message}</div>,
    ErrorMessage: ({ message }: any) => <div data-testid="error-message">{message}</div>,
    WarningMessage: ({ message }: any) => <div data-testid="warning-message">{message}</div>,
}));

jest.mock('./Transactions/Transactions', () => ({
    Transactions: () => <div data-testid="transactions">Transactions</div>,
}));

jest.mock('../../schemas /addMoneyValidationSchema', () => ({
    addMoneyValidationSchema: {
        validate: jest.fn().mockResolvedValue(true),
    },
}));

const mockCreateTransaction = jest.fn();
const mockAddMoney = jest.fn();
const mockExchange = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useCreateTransactionMutation: () => [mockCreateTransaction],
    useTransactionsQuery: jest.fn(),
    useAddMoneyMutation: () => [mockAddMoney],
    useMeQuery: jest.fn(),
    useAccountQuery: jest.fn(),
    useExchangeMutation: () => [mockExchange],
    useAccountsQuery: jest.fn(),
    useCardsQuery: jest.fn(),
    useDeleteAccountMutation: () => [mockDeleteAccount],
    TransactionsDocument: {},
}));

const { useTransactionsQuery, useMeQuery, useAccountQuery, useAccountsQuery, useCardsQuery } =
    require('../../generated/graphql');

describe('Account', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useTransactionsQuery.mockReturnValue({
            data: { transactions: [] },
        });
        useMeQuery.mockReturnValue({
            data: {
                me: { firstName: 'John', lastName: 'Doe' },
            },
        });
        useAccountQuery.mockReturnValue({
            data: { account: { balance: 1000 } },
        });
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: '1', currency: 'GBP', balance: 1000 },
                    { id: '2', currency: 'EUR', balance: 500 },
                ],
            },
        });
        useCardsQuery.mockReturnValue({
            data: { cards: [{ cardNumber: '1234567890123456' }] },
        });
    });

    it('renders account page with balance', () => {
        const { container } = render(<Account />);
        const balanceEl = container.querySelector('.accountBalance');
        expect(balanceEl).toBeInTheDocument();
        expect(balanceEl!.textContent).toContain('1000');
    });

    it('renders GBP currency info', () => {
        const { getByText } = render(<Account />);
        expect(getByText('British Pound')).toBeInTheDocument();
        expect(getByText('GBP')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
        const { getByText } = render(<Account />);
        expect(getByText('Add money')).toBeInTheDocument();
        expect(getByText('Exchange')).toBeInTheDocument();
        expect(getByText('Details')).toBeInTheDocument();
    });

    it('renders simulate button', () => {
        const { getByText } = render(<Account />);
        expect(getByText('Simulate')).toBeInTheDocument();
    });

    it('renders transactions component', () => {
        const { getByTestId } = render(<Account />);
        expect(getByTestId('transactions')).toBeInTheDocument();
    });

    it('opens add money dialog on click', () => {
        const { getByLabelText, getByTestId } = render(<Account />);
        fireEvent.click(getByLabelText('Add'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens exchange dialog on click', () => {
        const { getByLabelText, getByTestId } = render(<Account />);
        fireEvent.click(getByLabelText('Exchange'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens details dialog on click', () => {
        const { getByLabelText, getByTestId } = render(<Account />);
        fireEvent.click(getByLabelText('Details'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('shows error message when simulate clicked without card', () => {
        useCardsQuery.mockReturnValue({ data: { cards: [] } });
        const { getByText, getByTestId } = render(<Account />);
        fireEvent.click(getByText('Simulate'));
        expect(getByTestId('error-message')).toBeInTheDocument();
    });
});
