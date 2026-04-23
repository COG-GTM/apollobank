import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { useLoginMutation } from '../../generated/graphql';

jest.mock('../../generated/graphql', () => ({
    useLoginMutation: jest.fn(),
}));

jest.mock('../../utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('../../schemas /loginValidationSchema', () => ({
    loginValidationSchema: null,
}));

describe('Login', () => {
    beforeEach(() => {
        (useLoginMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
    });

    const renderLogin = () => {
        const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() } as any;
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
});
