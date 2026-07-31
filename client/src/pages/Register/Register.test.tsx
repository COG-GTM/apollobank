import React from 'react';
import { render, screen } from '@testing-library/react';
import { Register } from './Register';

// Mock GraphQL hooks
jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: () => [jest.fn(), {}],
}));

// Mock styles
jest.mock('./Register.style', () => ({
    useRegisterStyles: () => ({}),
}));

// Mock validation schema (note the space in the path)
jest.mock('../../schemas /registerValidationSchema', () => ({
    registerValidationSchema: {},
}));

// Mock form components as simple inputs
jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: (props: any) => (
        <input
            name={props.name}
            placeholder={props.placeholder}
            type={props.type}
            data-testid={`field-${props.name}`}
        />
    ),
    FormDatePicker: (props: any) => (
        <input
            name={props.name}
            data-testid={`field-${props.name}`}
        />
    ),
}));

// Mock ErrorMessage
jest.mock('../../components/Alerts/AlertMessage', () => ({
    ErrorMessage: (props: any) => <div data-testid="error-message">{props.message}</div>,
}));

const mockProps = { history: { push: jest.fn() } } as any;

describe('Register', () => {
    beforeEach(() => {
        render(<Register {...mockProps} />);
    });

    it('renders the "Sign Up" heading', () => {
        expect(screen.getByText('Sign Up', { selector: 'h1' })).toBeInTheDocument();
    });

    it('renders all form fields', () => {
        const fieldNames = [
            'firstName',
            'lastName',
            'streetAddres',
            'postCode',
            'city',
            'country',
            'email',
            'password',
            'confirmPassword',
            'dateOfBirth',
        ];

        fieldNames.forEach((name) => {
            expect(screen.getByTestId(`field-${name}`)).toBeInTheDocument();
        });
    });

    it('renders the "Sign Up" submit button', () => {
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows "Already have an account? Login here." link to /login', () => {
        expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
        const link = screen.getByText('Login here.');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/login');
    });

    it('submit button is present and is of type submit', () => {
        const button = screen.getByRole('button', { name: /sign up/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'submit');
    });
});
