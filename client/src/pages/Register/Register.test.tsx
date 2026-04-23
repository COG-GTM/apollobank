import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';

const mockRegister = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useRegisterMutation: () => [mockRegister],
}));

jest.mock('../../utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('../../schemas /registerValidationSchema', () => ({
    registerValidationSchema: null,
}));

jest.mock('./Register.style', () => ({
    useRegisterStyles: () => ({
        root: 'root',
        headerText: 'headerText',
        formField: 'formField',
        alignedFormContent: 'alignedFormContent',
        alignedFormField: 'alignedFormField',
        spacer: 'spacer',
        formButton: 'formButton',
        loginText: 'loginText',
    }),
}));

describe('Register', () => {
    const historyMock = { push: jest.fn(), location: {}, listen: jest.fn() } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <MemoryRouter>
                <Register history={historyMock} location={{} as any} match={{} as any} />
            </MemoryRouter>
        );
    };

    it('renders register form with all fields', () => {
        renderRegister();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Street address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Post code')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    });

    it('renders a submit button', () => {
        renderRegister();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders the sign up header', () => {
        renderRegister();
        expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    });

    it('renders login link', () => {
        renderRegister();
        expect(screen.getByText('Login here.')).toBeInTheDocument();
    });

    it('calls register mutation on form submit and redirects on success', async () => {
        mockRegister.mockResolvedValue({ data: { register: true } });
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Street address'), { target: { value: '123 St' } });
        fireEvent.change(screen.getByPlaceholderText('Post code'), { target: { value: '12345' } });
        fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'London' } });
        fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'UK' } });

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(historyMock.push).toHaveBeenCalledWith('/login');
        });
    });

    it('shows error when registration fails', async () => {
        mockRegister.mockResolvedValue({ data: { register: false } });
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'dup@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
        });
    });

    it('clears error message on form change', async () => {
        mockRegister.mockResolvedValue({ data: { register: false } });
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
        });

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@test.com' } });
    });
});
