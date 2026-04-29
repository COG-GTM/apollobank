import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from './Settings';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../assets/world.svg', () => ({
    ReactComponent: () => <div data-testid="euro-svg" />,
}));
jest.mock('../../assets/flag.svg', () => ({
    ReactComponent: () => <div data-testid="dollar-svg" />,
}));
jest.mock('../../assets/uk.svg', () => ({
    ReactComponent: () => <div data-testid="pound-svg" />,
}));

jest.mock('../../generated/graphql', () => ({
    useMeQuery: jest.fn(),
    useAccountsQuery: jest.fn(),
    useUpdatePasswordMutation: jest.fn(),
    useDestroyAccountMutation: jest.fn(),
    useLogoutMutation: jest.fn(),
}));

import {
    useMeQuery,
    useAccountsQuery,
    useUpdatePasswordMutation,
    useDestroyAccountMutation,
    useLogoutMutation,
} from '../../generated/graphql';

const mockUseMeQuery = useMeQuery as jest.Mock;
const mockUseAccountsQuery = useAccountsQuery as jest.Mock;
const mockUseUpdatePasswordMutation = useUpdatePasswordMutation as jest.Mock;
const mockUseDestroyAccountMutation = useDestroyAccountMutation as jest.Mock;
const mockUseLogoutMutation = useLogoutMutation as jest.Mock;

const renderSettings = () => {
    return render(
        <MemoryRouter>
            <Settings />
        </MemoryRouter>,
    );
};

describe('Settings', () => {
    beforeEach(() => {
        mockUseMeQuery.mockReturnValue({
            data: {
                me: {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    dateOfBirth: '1990-01-01T00:00:00Z',
                    streetAddress: '123 Main St',
                    postCode: '12345',
                    city: 'New York',
                    country: 'USA',
                },
            },
        });
        mockUseAccountsQuery.mockReturnValue({
            data: { accounts: [] },
        });
        mockUseUpdatePasswordMutation.mockReturnValue([jest.fn()]);
        mockUseDestroyAccountMutation.mockReturnValue([jest.fn()]);
        mockUseLogoutMutation.mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);
    });

    it('should render the user name', () => {
        renderSettings();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render Profile section', () => {
        renderSettings();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render Personal details menu item', () => {
        renderSettings();
        expect(screen.getByText('Personal details')).toBeInTheDocument();
    });

    it('should render Account details menu item', () => {
        renderSettings();
        expect(screen.getByText('Account details')).toBeInTheDocument();
    });

    it('should render Security section with Change password', () => {
        renderSettings();
        expect(screen.getByText('Security')).toBeInTheDocument();
        expect(screen.getByText('Change password')).toBeInTheDocument();
    });

    it('should render About us section', () => {
        renderSettings();
        expect(screen.getByText('About us')).toBeInTheDocument();
        expect(screen.getByText('About this website')).toBeInTheDocument();
    });

    it('should render Destroy account option', () => {
        renderSettings();
        expect(screen.getByText('Destroy account')).toBeInTheDocument();
    });

    it('should open personal details dialog when clicked', () => {
        renderSettings();
        const listItem = screen.getByText('Personal details').closest('div[role="button"]') || screen.getByText('Personal details');
        fireEvent.click(listItem);
        expect(screen.getByText(/john@example\.com/)).toBeInTheDocument();
    });
});
