import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

// Mock useLoginMutation and other graphql exports
jest.mock('../../generated/graphql', () => ({
    useLoginMutation: () => [jest.fn()],
    MeDocument: {},
}));

// Mock setAccessToken
jest.mock('../../utils/accessToken', () => ({
    setAccessToken: jest.fn(),
}));

// Mock the validation schema (note: path has a space in "schemas /")
jest.mock('../../schemas /loginValidationSchema', () => ({
    loginValidationSchema: require('yup').object({
        email: require('yup').string(),
        password: require('yup').string(),
    }),
}));

// Mock FormTextField to render a simple input so we avoid Formik useField issues
jest.mock('../../components/Forms/FormTextField', () => ({
    FormTextField: ({ name, placeholder, type, className }: { name: string; placeholder: string; type: string; className?: string }) => (
        <input name={name} placeholder={placeholder} type={type} className={className} />
    ),
}));

const renderLogin = () => {
    const history = {
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        listen: jest.fn(),
        location: { pathname: '/login', search: '', hash: '', state: undefined },
        length: 1,
        action: 'PUSH' as const,
        block: jest.fn(),
        createHref: jest.fn(),
    };

    const match = {
        params: {},
        isExact: true,
        path: '/login',
        url: '/login',
    };

    const location = {
        pathname: '/login',
        search: '',
        hash: '',
        state: undefined,
    };

    return render(
        <MemoryRouter>
            <Login history={history as any} location={location as any} match={match} />
        </MemoryRouter>,
    );
};

describe('Login Page', () => {
    it('renders without crashing', () => {
        renderLogin();
    });

    it('displays "Login" heading', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    it('renders email and password form fields', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('renders the Login submit button', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('contains a "Sign up here." link to /register', () => {
        renderLogin();
        const link = screen.getByText('Sign up here.');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/register');
    });

    it('Login button is initially enabled (not disabled)', () => {
        renderLogin();
        expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled();
    });
});
