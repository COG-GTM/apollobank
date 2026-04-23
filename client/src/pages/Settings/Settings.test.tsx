import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        push: mockPush,
    }),
}));

const mockUpdatePassword = jest.fn();
const mockDestroyAccount = jest.fn();
const mockLogout = jest.fn().mockResolvedValue({ data: { logout: true } });
const mockResetStore = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useMeQuery: () => ({
        data: {
            me: {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '1990-01-15T00:00:00.000Z',
                streetAddress: '123 Main St',
                postCode: '12345',
                city: 'Dublin',
                country: 'Ireland',
            },
        },
    }),
    useAccountsQuery: () => ({
        data: {
            accounts: [
                { id: 1, currency: 'EUR', balance: 1000, sortCode: '123456', iban: 'IE12APLO00990012345678', bic: 'APLBIE2D' },
                { id: 2, currency: 'USD', balance: 500, sortCode: '654321', iban: 'US12APLO00990012345678', bic: 'APLBUS2D' },
            ],
        },
    }),
    useUpdatePasswordMutation: () => [mockUpdatePassword, {}],
    useDestroyAccountMutation: () => [mockDestroyAccount, {}],
    useLogoutMutation: () => [mockLogout, { client: { resetStore: mockResetStore } }],
}));

jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <span>{title}</span>,
}));

jest.mock('../../components/Alerts/AlertMessage', () => ({
    SuccessMessage: ({ message }: { message: string }) => <div role="alert">{message}</div>,
    ErrorMessage: ({ message }: { message: string }) => <div role="alert">{message}</div>,
}));

jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ placeholder, name }: { placeholder: string; name: string }) => (
        <input placeholder={placeholder} name={name} />
    ),
}));

jest.mock('../../schemas /changePasswordValidationSchema', () => ({
    changePasswordValidationSchema: {},
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

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user name', () => {
        render(<Settings />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders Profile section title', () => {
        render(<Settings />);
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders Security section title', () => {
        render(<Settings />);
        expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('renders About us section title', () => {
        render(<Settings />);
        expect(screen.getByText('About us')).toBeInTheDocument();
    });

    it('renders Personal details menu item', () => {
        render(<Settings />);
        expect(screen.getByText('Personal details')).toBeInTheDocument();
    });

    it('renders Account details menu item', () => {
        render(<Settings />);
        expect(screen.getByText('Account details')).toBeInTheDocument();
    });

    it('renders Change password menu item', () => {
        render(<Settings />);
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('renders About this website menu item', () => {
        render(<Settings />);
        expect(screen.getByText('About this website')).toBeInTheDocument();
    });

    it('renders Destroy account option', () => {
        render(<Settings />);
        expect(screen.getByText('Destroy account')).toBeInTheDocument();
    });

    it('opens the Personal details dialog when clicked', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('Personal details'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Full name & date of birth/)).toBeInTheDocument();
    });

    it('opens the Account details dialog when clicked', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('Account details'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens the Change password dialog when clicked', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('Change password'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Old password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('opens the About dialog when clicked', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('About this website'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('does not show alert messages initially', () => {
        render(<Settings />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays personal details in dialog', () => {
        render(<Settings />);
        fireEvent.click(screen.getByText('Personal details'));
        expect(screen.getByText(/Residential address/)).toBeInTheDocument();
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
        expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    });
});
