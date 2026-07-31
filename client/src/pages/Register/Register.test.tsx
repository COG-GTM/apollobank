import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';

// Mock the GraphQL generated hooks
jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: () => [jest.fn()],
}));

// Mock the validation schema (note the space in "schemas /")
jest.mock('../../schemas /registerValidationSchema', () => ({
    registerValidationSchema: undefined,
}));

// Mock the style hook
jest.mock('./Register.style', () => ({
    useRegisterStyles: () => ({
        root: 'root',
        headerText: 'headerText',
        alignedFormContent: 'alignedFormContent',
        alignedFormField: 'alignedFormField',
        formField: 'formField',
        formButton: 'formButton',
        loginText: 'loginText',
        spacer: 'spacer',
    }),
}));

const mockHistory = {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    listen: jest.fn(),
    block: jest.fn(),
    createHref: jest.fn(),
    action: 'PUSH' as const,
    length: 1,
    location: {
        pathname: '/register',
        search: '',
        hash: '',
        state: undefined,
    },
};

const mockLocation = {
    pathname: '/register',
    search: '',
    hash: '',
    state: undefined,
};

const mockMatch = {
    params: {},
    isExact: true,
    path: '/register',
    url: '/register',
};

const renderRegister = () => {
    return render(
        <MemoryRouter>
            <Register
                history={mockHistory as any}
                location={mockLocation as any}
                match={mockMatch as any}
            />
        </MemoryRouter>
    );
};

describe('Register Page', () => {
    it('renders without crashing', () => {
        renderRegister();
    });

    it('displays "Sign Up" heading', () => {
        renderRegister();
        const heading = screen.getByRole('heading', { name: 'Sign Up' });
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H1');
    });

    it('renders all form fields', () => {
        renderRegister();

        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Street address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Post code')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    });

    it('renders the dateOfBirth field', () => {
        renderRegister();
        expect(screen.getByText('Date of birth')).toBeInTheDocument();
    });

    it('renders the "Sign Up" submit button', () => {
        renderRegister();
        const buttons = screen.getAllByText('Sign Up');
        const submitButton = buttons.find(
            (el) => el.closest('button') !== null
        );
        expect(submitButton).toBeDefined();
        expect(submitButton!.closest('button')).toHaveAttribute('type', 'submit');
    });

    it('contains a "Login here." link to /login', () => {
        renderRegister();
        const loginLink = screen.getByText('Login here.');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('Sign Up button is initially enabled', () => {
        renderRegister();
        const buttons = screen.getAllByText('Sign Up');
        const submitButton = buttons.find(
            (el) => el.closest('button') !== null
        );
        expect(submitButton!.closest('button')).not.toBeDisabled();
    });
});
