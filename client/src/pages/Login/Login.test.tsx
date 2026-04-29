import React from 'react';
import { render, screen } from '@testing-library/react';
import { Login } from './Login';
import { MemoryRouter, Route } from 'react-router-dom';

jest.mock('../../generated/graphql', () => ({
    useLoginMutation: jest.fn(),
    MeDocument: {},
    MeQuery: {},
    LoginMutation: {},
    LoginMutationVariables: {},
}));

import { useLoginMutation } from '../../generated/graphql';

const mockUseLoginMutation = useLoginMutation as jest.Mock;

const renderLogin = () => {
    return render(
        <MemoryRouter initialEntries={['/login']}>
            <Route path="/login" component={Login} />
        </MemoryRouter>,
    );
};

describe('Login', () => {
    beforeEach(() => {
        mockUseLoginMutation.mockReturnValue([jest.fn()]);
    });

    it('should render the login heading', () => {
        renderLogin();
        const heading = screen.getByRole('heading', { name: 'Login' });
        expect(heading).toBeInTheDocument();
    });

    it('should render email and password fields', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should render a submit button', () => {
        renderLogin();
        const buttons = screen.getAllByText('Login');
        const submitButton = buttons.find(
            el => el.tagName === 'SPAN' || el.closest('button[type="submit"]'),
        );
        expect(submitButton).toBeInTheDocument();
    });

    it('should render a link to the registration page', () => {
        renderLogin();
        expect(screen.getByText('Sign up here.')).toBeInTheDocument();
        expect(screen.getByText('Sign up here.')).toHaveAttribute('href', '/register');
    });
});
