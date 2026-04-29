import React from 'react';
import { render, screen } from '@testing-library/react';
import { Register } from './Register';
import { RouteComponentProps } from 'react-router-dom';

const mockRegister = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: () => [mockRegister, {}],
}));

jest.mock('./Register.style', () => ({
    useRegisterStyles: () => ({
        root: 'root',
        headerText: 'headerText',
        formField: 'formField',
        alignedFormField: 'alignedFormField',
        alignedFormContent: 'alignedFormContent',
        spacer: 'spacer',
        formButton: 'formButton',
        loginText: 'loginText',
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
        location: { pathname: '/register', search: '', hash: '', state: undefined },
    },
    location: { pathname: '/register', search: '', hash: '', state: undefined },
    match: { params: {}, isExact: true, path: '/register', url: '/register' },
});

describe('Register', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the Sign Up heading', () => {
        render(<Register {...createMockRouteProps()} />);
        expect(screen.getByRole('heading', { name: /Sign Up/i })).toBeInTheDocument();
    });

    it('renders all form input fields', () => {
        render(<Register {...createMockRouteProps()} />);
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

    it('renders the date of birth picker', () => {
        render(<Register {...createMockRouteProps()} />);
        expect(screen.getByText('Date of birth')).toBeInTheDocument();
    });

    it('renders the sign up submit button', () => {
        render(<Register {...createMockRouteProps()} />);
        const button = screen.getByRole('button', { name: /sign up/i });
        expect(button).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
        render(<Register {...createMockRouteProps()} />);
        const link = screen.getByText('Login here.');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/login');
    });

    it('renders the "Already have an account?" text', () => {
        render(<Register {...createMockRouteProps()} />);
        expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument();
    });

    it('does not show error message initially', () => {
        render(<Register {...createMockRouteProps()} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});
