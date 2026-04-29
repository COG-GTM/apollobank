import React from 'react';
import { render, screen } from '@testing-library/react';
import { Login } from './Login';
import { RouteComponentProps } from 'react-router-dom';

const mockLogin = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useLoginMutation: () => [mockLogin, {}],
    MeDocument: {},
}));

jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

jest.mock('./Login.style', () => ({
    useLoginStyles: () => ({
        root: 'root',
        headerText: 'headerText',
        formField: 'formField',
        formButton: 'formButton',
        registerText: 'registerText',
    }),
}));

const createMockRouteProps = (): RouteComponentProps => ({
    history: {
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        listen: jest.fn(),
        createHref: jest.fn(),
        block: jest.fn(),
        length: 0,
        action: 'PUSH' as const,
        location: { pathname: '/login', search: '', hash: '', state: undefined },
    },
    location: { pathname: '/login', search: '', hash: '', state: undefined },
    match: { params: {}, isExact: true, path: '/login', url: '/login' },
});

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Login heading', () => {
        render(<Login {...createMockRouteProps()} />);
        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    });

    it('renders email and password input fields', () => {
        render(<Login {...createMockRouteProps()} />);
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('renders the login submit button', () => {
        render(<Login {...createMockRouteProps()} />);
        const button = screen.getByRole('button', { name: /login/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders a link to the registration page', () => {
        render(<Login {...createMockRouteProps()} />);
        const link = screen.getByText('Sign up here.');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/register');
    });

    it('renders the "Don\'t have an account?" text', () => {
        render(<Login {...createMockRouteProps()} />);
        expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument();
    });

    it('does not show error message initially', () => {
        render(<Login {...createMockRouteProps()} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
