import React from 'react';
import { render, screen } from '@testing-library/react';
import { Register } from './Register';
import { MemoryRouter, Route } from 'react-router-dom';

jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: jest.fn(),
    RegisterMutation: {},
    RegisterMutationVariables: {},
}));

import { useRegisterMutation } from '../../generated/graphql';

const mockUseRegisterMutation = useRegisterMutation as jest.Mock;

const renderRegister = () => {
    return render(
        <MemoryRouter initialEntries={['/register']}>
            <Route path="/register" component={Register} />
        </MemoryRouter>,
    );
};

describe('Register', () => {
    beforeEach(() => {
        mockUseRegisterMutation.mockReturnValue([jest.fn()]);
    });

    it('should render the Sign Up heading', () => {
        renderRegister();
        const heading = screen.getByRole('heading', { name: 'Sign Up' });
        expect(heading).toBeInTheDocument();
    });

    it('should render all registration form fields', () => {
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

    it('should render a date of birth field', () => {
        renderRegister();
        expect(screen.getAllByText(/Date of birth/).length).toBeGreaterThan(0);
    });

    it('should render a submit button', () => {
        renderRegister();
        const buttons = screen.getAllByText('Sign Up');
        expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should render a link to the login page', () => {
        renderRegister();
        expect(screen.getByText('Login here.')).toBeInTheDocument();
        expect(screen.getByText('Login here.')).toHaveAttribute('href', '/login');
    });
});
