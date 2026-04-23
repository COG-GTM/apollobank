import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Toolbar } from './Toolbar';
import { useMeQuery, useLogoutMutation } from '../../generated/graphql';

jest.mock('../../generated/graphql', () => ({
    useMeQuery: jest.fn(),
    useLogoutMutation: jest.fn(),
}));

jest.mock('../../utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('../SideDrawer/DrawerToggleButton', () => ({
    DrawerToggleButton: ({ click }: { click: () => void }) => (
        <button data-testid="drawer-toggle" onClick={click}>Toggle</button>
    ),
}));

describe('Toolbar', () => {
    const mockDrawerClickHandler = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders non-auth buttons when user is not logged in', () => {
        (useMeQuery as jest.Mock).mockReturnValue({ data: null, loading: false });
        (useLogoutMutation as jest.Mock).mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);

        render(
            <MemoryRouter>
                <Toolbar drawerClickHandler={mockDrawerClickHandler} />
            </MemoryRouter>
        );

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('renders auth buttons when user is logged in', () => {
        (useMeQuery as jest.Mock).mockReturnValue({
            data: { me: { id: 1, email: 'test@test.com' } },
            loading: false,
        });
        (useLogoutMutation as jest.Mock).mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);

        render(
            <MemoryRouter>
                <Toolbar drawerClickHandler={mockDrawerClickHandler} />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('calls drawerClickHandler when toggle button is clicked', () => {
        (useMeQuery as jest.Mock).mockReturnValue({ data: null, loading: false });
        (useLogoutMutation as jest.Mock).mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);

        render(
            <MemoryRouter>
                <Toolbar drawerClickHandler={mockDrawerClickHandler} />
            </MemoryRouter>
        );

        const toggleButton = screen.getByTestId('drawer-toggle');
        toggleButton.click();
        expect(mockDrawerClickHandler).toHaveBeenCalledTimes(1);
    });
});
