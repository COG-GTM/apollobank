import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Settings } from './Settings';

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <svg data-testid="euro-svg" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <svg data-testid="dollar-svg" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <svg data-testid="pound-svg" />,
}));

// Mock graphql hooks
const mockUseMeQuery = jest.fn();
const mockUseAccountsQuery = jest.fn();
const mockUpdatePassword = jest.fn();
const mockDestroyAccount = jest.fn();
const mockLogout = jest.fn();
const mockResetStore = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useMeQuery: () => mockUseMeQuery(),
    useAccountsQuery: () => mockUseAccountsQuery(),
    useUpdatePasswordMutation: () => [mockUpdatePassword],
    useDestroyAccountMutation: () => [mockDestroyAccount],
    useLogoutMutation: () => [mockLogout, { client: { resetStore: mockResetStore } }],
}));

// Mock react-router-dom
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    useHistory: () => ({ push: mockPush }),
}));

// Mock accessToken
jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

// Mock validation schema
jest.mock('../../schemas /changePasswordValidationSchema', () => ({
    changePasswordValidationSchema: {},
}));

// Mock graphql/execution/execute
jest.mock('graphql/execution/execute', () => ({}));

// Mock Dialog to render children when isOpen is true
jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

// Mock FormTextField
jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ name, placeholder }: { name: string; placeholder: string }) => (
        <input data-testid={`form-field-${name}`} placeholder={placeholder} />
    ),
}));

// Mock Title to render its title prop
jest.mock('../../components/Typography/Title', () => ({
    Title: ({ title }: { title: string }) => <span>{title}</span>,
}));

// Mock Loading
jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

// Mock AlertMessage
jest.mock('../../components/Alerts/AlertMessage', () => ({
    SuccessMessage: ({ message }: { message: string }) => (
        <div data-testid="success-message">{message}</div>
    ),
    ErrorMessage: ({ message }: { message: string }) => (
        <div data-testid="error-message">{message}</div>
    ),
}));

const defaultMeData = {
    data: {
        me: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            dateOfBirth: '1990-01-01',
            streetAddress: '123 Main St',
            postCode: '12345',
            city: 'Dublin',
            country: 'Ireland',
        },
    },
};

const defaultAccountsData = {
    data: {
        accounts: [],
    },
};

beforeEach(() => {
    jest.clearAllMocks();
    mockUseMeQuery.mockReturnValue(defaultMeData);
    mockUseAccountsQuery.mockReturnValue(defaultAccountsData);
});

describe('Settings', () => {
    it('renders user name from useMeQuery data', () => {
        render(<Settings />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders "Profile" section with "Personal details" and "Account details" list items', () => {
        render(<Settings />);
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Personal details')).toBeInTheDocument();
        expect(screen.getByText('Account details')).toBeInTheDocument();
    });

    it('renders "Security" section with "Change password" list item', () => {
        render(<Settings />);
        expect(screen.getByText('Security')).toBeInTheDocument();
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('renders "About us" section with "About this website" list item', () => {
        render(<Settings />);
        expect(screen.getByText('About us')).toBeInTheDocument();
        expect(screen.getByText('About this website')).toBeInTheDocument();
    });

    it('renders "Destroy account" list item', () => {
        render(<Settings />);
        expect(screen.getByText('Destroy account')).toBeInTheDocument();
    });

    it('opens personal details dialog on click and shows dialog content', async () => {
        await act(async () => {
            render(<Settings />);
        });
        fireEvent.click(screen.getByText('Personal details'));
        const dialog = screen.getByTestId('dialog');
        expect(dialog).toBeInTheDocument();
        expect(screen.getByText('Full name & date of birth')).toBeInTheDocument();
        expect(screen.getByText('Residential address')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(dialog).toHaveTextContent('john@test.com');
        expect(dialog).toHaveTextContent('123 Main St');
        expect(dialog).toHaveTextContent('Ireland');
    });
});
