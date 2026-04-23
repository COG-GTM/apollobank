import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { FormTextField, FormDatePicker } from './FormTextField';

const renderWithFormik = (ui: React.ReactElement, initialValues: Record<string, string> = {}) => {
    return render(
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
            <Form>{ui}</Form>
        </Formik>
    );
};

describe('FormTextField', () => {
    it('renders an input with the given placeholder', () => {
        renderWithFormik(
            <FormTextField name="email" placeholder="Email" type="input" />,
            { email: '' }
        );
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    });
});

describe('FormDatePicker', () => {
    it('renders a date input with "Date of birth" label', () => {
        renderWithFormik(
            <FormDatePicker name="dateOfBirth" placeholder="DOB" />,
            { dateOfBirth: '' }
        );
        expect(screen.getAllByText(/Date of birth/).length).toBeGreaterThan(0);
        const input = screen.getByPlaceholderText('DOB');
        expect(input).toHaveAttribute('type', 'date');
    });
});
