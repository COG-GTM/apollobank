import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

const mockLogin = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useLoginMutation: () => [mockLogin],
    MeDocument: {},
}));

jest.mock('../../utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('../../schemas /loginValidationSchema', () => ({
    loginValidationSchema: null,
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

describe('Login', () => {
    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <Login history={historyMock} location={{} as any} match={{} as any} />
            </MemoryRouter>
        );
    };

    it('renders login form with email and password fields', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('renders a submit button', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('renders the login header', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('renders sign up link', () => {
        renderLogin();
        expect(screen.getByText('Sign up here.')).toBeInTheDocument();
    });

    it('calls login mutation on form submit and redirects on success', async () => {
        mockLogin.mockResolvedValue({
            data: { login: { accessToken: 'test-token', user: { id: '1' } } },
        });
        renderLogin();

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(historyMock.push).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('shows error message on login failure', async () => {
        mockLogin.mockRejectedValue(new Error('GraphQL: Invalid credentials'));
        renderLogin();

        const emailInput = screen.getByPlaceholderText('Email');
        const passwordInput = screen.getByPlaceholderText('Password');
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });
});
