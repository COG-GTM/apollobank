import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useLoginMutation
const mockLoginMutation = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useLoginMutation: () => [mockLoginMutation],
}));

// Mock setAccessToken
jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

// Mock styles
jest.mock('./Login.style', () => ({
    useLoginStyles: () => ({}),
}));

// Mock validation schema (note the space in the path)
jest.mock('../../schemas /loginValidationSchema', () => ({
    loginValidationSchema: null,
}));

// Mock FormTextField as a simple input
jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ name, placeholder, type, ...rest }: any) => (
        <input
            name={name}
            placeholder={placeholder}
            type={type}
            data-testid={`field-${name}`}
        />
    ),
}));

// Mock ErrorMessage
jest.mock('../../components/Alerts/AlertMessage', () => ({
    ErrorMessage: ({ message }: { message: string }) => (
        <div data-testid="error-message">{message}</div>
    ),
}));

import { Login } from './Login';

const createProps = () =>
    ({
        history: { push: jest.fn() },
    } as any);

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the "Login" heading', () => {
        render(<Login {...createProps()} />);
        expect(screen.getByText('Login', { selector: 'h1' })).toBeInTheDocument();
    });

    it('renders email and password form fields', () => {
        render(<Login {...createProps()} />);
        expect(screen.getByTestId('field-email')).toBeInTheDocument();
        expect(screen.getByTestId('field-password')).toBeInTheDocument();
    });

    it('renders the Login submit button', () => {
        render(<Login {...createProps()} />);
        const button = screen.getByRole('button', { name: /login/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('shows the "Don\'t have an account? Sign up here." link to /register', () => {
        render(<Login {...createProps()} />);
        expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument();
        const link = screen.getByText('Sign up here.');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/register');
    });

    it('submit button is present and can be clicked', () => {
        render(<Login {...createProps()} />);
        const button = screen.getByRole('button', { name: /login/i });
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
    });

    it('displays error message when login fails', async () => {
        mockLoginMutation.mockRejectedValueOnce(
            new Error('GraphQL:Invalid credentials')
        );

        render(<Login {...createProps()} />);

        const button = screen.getByRole('button', { name: /login/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
        });
    });
});
