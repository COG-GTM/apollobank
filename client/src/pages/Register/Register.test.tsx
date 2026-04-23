import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';
import { useRegisterMutation } from '../../generated/graphql';

jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: jest.fn(),
}));

jest.mock('../../utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('../../schemas /registerValidationSchema', () => ({
    registerValidationSchema: null,
}));

describe('Register', () => {
    beforeEach(() => {
        (useRegisterMutation as jest.Mock).mockReturnValue([jest.fn(), { loading: false }]);
    });

    const renderRegister = () => {
        const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() } as any;
        return render(
            <MemoryRouter>
                <Register history={historyMock} location={{} as any} match={{} as any} />
            </MemoryRouter>
        );
    };

    it('renders register form with email, password, and name fields', () => {
        renderRegister();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    });

    it('renders a submit button', () => {
        renderRegister();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
});
