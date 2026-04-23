import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';

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
jest.mock('react-router-dom', () => ({
    useHistory: () => ({ push: mockPush }),
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

jest.mock('../../components/Alerts/AlertMessage', () => ({
    SuccessMessage: ({ message }: any) => <div data-testid="success-message">{message}</div>,
    ErrorMessage: ({ message }: any) => <div data-testid="error-message">{message}</div>,
}));

jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ name, placeholder }: any) => (
        <input name={name} placeholder={placeholder} data-testid={`form-field-${name}`} />
    ),
}));

const mockUpdatePassword = jest.fn();
const mockDestroyAccount = jest.fn();
const mockLogout = jest.fn().mockResolvedValue({});
const mockClient = { resetStore: jest.fn() };

jest.mock('../../generated/graphql', () => ({
    useMeQuery: jest.fn(),
    useAccountsQuery: jest.fn(),
    useUpdatePasswordMutation: () => [mockUpdatePassword],
    useDestroyAccountMutation: () => [mockDestroyAccount],
    useLogoutMutation: () => [mockLogout, { client: mockClient }],
}));

jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

jest.mock('../../schemas /changePasswordValidationSchema', () => ({
    changePasswordValidationSchema: {
        validate: jest.fn().mockResolvedValue(true),
    },
}));

const { useMeQuery, useAccountsQuery } = require('../../generated/graphql');

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useMeQuery.mockReturnValue({
            data: {
                me: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    dateOfBirth: '1990-01-01',
                    streetAddress: '123 Main St',
                    postCode: '12345',
                    city: 'London',
                    country: 'UK',
                },
            },
        });
        useAccountsQuery.mockReturnValue({
            data: {
                accounts: [
                    { id: '1', currency: 'GBP', balance: 1000 },
                    { id: '2', currency: 'EUR', balance: 500 },
                    { id: '3', currency: 'USD', balance: 300 },
                ],
            },
        });
    });

    it('renders settings page with user name', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('John Doe')).toBeInTheDocument();
    });

    it('renders profile section', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('Profile')).toBeInTheDocument();
        expect(getByText('Personal details')).toBeInTheDocument();
        expect(getByText('Account details')).toBeInTheDocument();
    });

    it('renders security section', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('Security')).toBeInTheDocument();
        expect(getByText('Change password')).toBeInTheDocument();
    });

    it('renders about us section', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('About us')).toBeInTheDocument();
        expect(getByText('About this website')).toBeInTheDocument();
    });

    it('renders destroy account button', () => {
        const { getByText } = render(<Settings />);
        expect(getByText('Destroy account')).toBeInTheDocument();
    });

    it('opens personal details dialog on click', () => {
        const { getByText, getByTestId } = render(<Settings />);
        fireEvent.click(getByText('Personal details'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens account details dialog on click', () => {
        const { getByText, getByTestId } = render(<Settings />);
        fireEvent.click(getByText('Account details'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens change password dialog on click', () => {
        const { getByText, getByTestId } = render(<Settings />);
        fireEvent.click(getByText('Change password'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });

    it('opens about dialog on click', () => {
        const { getByText, getByTestId } = render(<Settings />);
        fireEvent.click(getByText('About this website'));
        expect(getByTestId('dialog')).toBeInTheDocument();
    });
});
