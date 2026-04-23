import React from 'react';
import { render, screen } from '@testing-library/react';
import { Routes } from './Routes';
import { getAccessToken } from './utils/accessToken';

jest.mock('./components/Toolbar/Toolbar', () => ({
    Toolbar: () => <div data-testid="toolbar" />,
}));
jest.mock('./components/SideDrawer/SideDrawer', () => ({
    SideDrawer: () => <div data-testid="sidedrawer" />,
}));
jest.mock('./components/Backdrop/Backdrop', () => ({
    Backdrop: () => <div data-testid="backdrop" />,
}));
jest.mock('react-helmet', () => ({
    Helmet: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('./pages/Dashboard/Dashboard', () => ({
    Dashboard: () => <div>Dashboard Page</div>,
}));
jest.mock('./pages/Settings/Settings', () => ({
    Settings: () => <div>Settings Page</div>,
}));
jest.mock('./pages/Accounts/Account', () => ({
    Account: () => <div>Account Page</div>,
}));
jest.mock('./pages/Login/Login', () => ({
    Login: () => <div>Login Page</div>,
}));
jest.mock('./pages/Register/Register', () => ({
    Register: () => <div>Register Page</div>,
}));
jest.mock('./pages/Bye', () => ({
    Bye: () => <div>Bye Page</div>,
}));
jest.mock('./utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

describe('Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Home page at "/" route', () => {
        (getAccessToken as jest.Mock).mockReturnValue('');
        window.history.pushState({}, '', '/');
        render(<Routes />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('renders 404 for unknown routes', () => {
        (getAccessToken as jest.Mock).mockReturnValue('');
        window.history.pushState({}, '', '/some-unknown-route');
        render(<Routes />);
        expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });

    it('AuthenticatedRoute redirects to /login when no token', () => {
        (getAccessToken as jest.Mock).mockReturnValue('');
        window.history.pushState({}, '', '/dashboard');
        render(<Routes />);
        expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('LoggedInRoute redirects to /dashboard when token exists', () => {
        (getAccessToken as jest.Mock).mockReturnValue('some-token');
        window.history.pushState({}, '', '/login');
        render(<Routes />);
        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
});
