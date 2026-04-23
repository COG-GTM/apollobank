import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { FormTextField, FormDatePicker } from './FormTextField';

const renderWithFormik = (ui: React.ReactElement, initialValues: Record<string, any> = {}) => {
    return render(
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
            <Form>{ui}</Form>
        </Formik>,
    );
};

describe('FormTextField', () => {
    it('should render a text input with placeholder', () => {
        renderWithFormik(
            <FormTextField name="email" placeholder="Email" type="input" />,
            { email: '' },
        );
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });

    it('should render a password input', () => {
        renderWithFormik(
            <FormTextField name="password" placeholder="Password" type="password" />,
            { password: '' },
        );
        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('should render as required', () => {
        renderWithFormik(
            <FormTextField name="field" placeholder="Field" type="input" />,
            { field: '' },
        );
        const input = screen.getByPlaceholderText('Field');
        expect(input).toBeRequired();
    });
});

describe('FormDatePicker', () => {
    it('should render a date input with label', () => {
        renderWithFormik(
            <FormDatePicker name="dateOfBirth" placeholder="DOB" />,
            { dateOfBirth: '' },
        );
        expect(screen.getAllByText(/Date of birth/).length).toBeGreaterThan(0);
    });

    it('should render input with date type', () => {
        const { container } = renderWithFormik(
            <FormDatePicker name="dateOfBirth" placeholder="DOB" />,
            { dateOfBirth: '' },
        );
        const input = container.querySelector('input[type="date"]');
        expect(input).toBeInTheDocument();
    });
});
