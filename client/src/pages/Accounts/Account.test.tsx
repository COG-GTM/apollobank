import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Account } from './Account';

const mockPush = jest.fn();
const mockGo = jest.fn();

jest.mock('react-router-dom', () => ({
    useLocation: () => ({
        state: {
            currency: 'USD',
            balance: 1000,
            iban: 'IE12BOFI90001712345678',
            bic: 'BOFIIE2D',
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
    useCreateTransactionMutation: () => [mockCreateTransaction],
    useAddMoneyMutation: () => [mockAddMoney],
    useExchangeMutation: () => [mockExchange],
    useDeleteAccountMutation: () => [mockDeleteAccount],
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
            account: { id: 1, balance: 1500 },
        },
    }),
    useAccountsQuery: () => ({
        data: {
            accounts: [
                { id: 1, currency: 'USD', balance: 1500 },
                { id: 2, currency: 'EUR', balance: 500 },
            ],
        },
    }),
    useCardsQuery: () => ({
        data: {
            cards: [{ cardNumber: '4111111111111111' }],
        },
    }),
    useTransactionsQuery: () => ({
        data: {
            transactions: [
                {
                    id: 1,
                    transactionType: 'payment',
                    date: '2024-01-15T00:00:00.000Z',
                    amount: '50.00',
                },
            ],
        },
    }),
    TransactionsDocument: {},
}));

jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <svg data-testid="euro-icon" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <svg data-testid="dollar-icon" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <svg data-testid="pound-icon" />,
}));

jest.mock('../../schemas /addMoneyValidationSchema', () => ({
    addMoneyValidationSchema: {},
}));

describe('Account', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the account balance', () => {
        render(<Account />);
        expect(screen.getByText(/1500/)).toBeInTheDocument();
    });

    it('renders the currency info for USD', () => {
        render(<Account />);
        expect(screen.getByText('US Dollar')).toBeInTheDocument();
        expect(screen.getByText('USD')).toBeInTheDocument();
    });

    it('renders Add money, Exchange, and Details buttons', () => {
        render(<Account />);
        expect(screen.getByText('Add money')).toBeInTheDocument();
        expect(screen.getByText('Exchange')).toBeInTheDocument();
        expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('renders the Simulate button', () => {
        render(<Account />);
        expect(screen.getByText('Simulate')).toBeInTheDocument();
    });

    it('opens the Add money dialog when the Add button is clicked', () => {
        render(<Account />);
        const addButton = screen.getByLabelText('Add');
        fireEvent.click(addButton);
        expect(screen.getAllByText('Add money').length).toBeGreaterThanOrEqual(2);
    });

    it('opens the Exchange dialog when the Exchange button is clicked', () => {
        render(<Account />);
        const exchangeButton = screen.getByLabelText('Exchange');
        fireEvent.click(exchangeButton);
        expect(screen.getAllByText('Exchange').length).toBeGreaterThanOrEqual(2);
    });

    it('opens the Details dialog when the Details button is clicked', () => {
        render(<Account />);
        const detailsButton = screen.getByLabelText('Details');
        fireEvent.click(detailsButton);
        expect(screen.getByText(/Beneficiary/)).toBeInTheDocument();
        expect(screen.getByText(/IE12BOFI90001712345678/)).toBeInTheDocument();
        expect(screen.getByText(/BOFIIE2D/)).toBeInTheDocument();
    });
});
