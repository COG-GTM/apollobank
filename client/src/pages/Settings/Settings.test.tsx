import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from './Settings';

// Mock GraphQL hooks
const mockDestroyAccount = jest.fn();
const mockUpdatePassword = jest.fn();
const mockLogout = jest.fn();
const mockResetStore = jest.fn();

jest.mock('../../generated/graphql', () => ({
    useMeQuery: () => ({
        data: {
            me: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com',
                dateOfBirth: '1990-01-01T00:00:00Z',
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
                {
                    id: '1',
                    currency: 'EUR',
                    balance: 1000,
                    iban: 'IE12BOFI90001234567890',
                    bic: 'BOFIIE2D',
                },
            ],
        },
    }),
    useUpdatePasswordMutation: () => [mockUpdatePassword],
    useDestroyAccountMutation: () => [mockDestroyAccount],
    useLogoutMutation: () => [mockLogout, { client: { resetStore: mockResetStore } }],
    Account: {},
}));

// Mock react-router-dom useHistory
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}));

// Mock setAccessToken
jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

// Mock validation schema
jest.mock('../../schemas /changePasswordValidationSchema', () => ({
    changePasswordValidationSchema: {},
}));

// Mock SVG imports
jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-icon" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-icon" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-icon" />,
}));

// Mock Dialog component
jest.mock('../../components/Dialog/Dialog', () => ({
    Dialog: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
        isOpen ? <div data-testid="dialog">{children}</div> : null,
}));

// Mock Loading component
jest.mock('../../components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading">Loading...</div>,
}));

const renderSettings = () => {
    return render(
        <MemoryRouter>
            <Settings />
        </MemoryRouter>
    );
};

describe('Settings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderSettings();
    });

    it('displays user name "John Doe"', () => {
        renderSettings();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders "Profile" section title', () => {
        renderSettings();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders "Personal details" list item', () => {
        renderSettings();
        expect(screen.getByText('Personal details')).toBeInTheDocument();
    });

    it('renders "Account details" list item', () => {
        renderSettings();
        expect(screen.getByText('Account details')).toBeInTheDocument();
    });

    it('renders "Security" section title', () => {
        renderSettings();
        expect(screen.getByText('Security')).toBeInTheDocument();
    });

    it('renders "Change password" list item', () => {
        renderSettings();
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('renders "About us" section title', () => {
        renderSettings();
        expect(screen.getByText('About us')).toBeInTheDocument();
    });

    it('renders "About this website" list item', () => {
        renderSettings();
        expect(screen.getByText('About this website')).toBeInTheDocument();
    });

    it('renders "Destroy account" list item', () => {
        renderSettings();
        expect(screen.getByText('Destroy account')).toBeInTheDocument();
    });

    it('shows loading state when showLoadingIcon is true', async () => {
        mockDestroyAccount.mockResolvedValueOnce({ data: { destroyAccount: true } });

        renderSettings();

        const destroyButton = screen.getByText('Destroy account');

        await act(async () => {
            destroyButton.click();
            await new Promise((r) => setTimeout(r, 50));
        });

        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
