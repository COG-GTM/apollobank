import React from 'react';
import { render } from '@testing-library/react';
import { SuccessMessage, WarningMessage, ErrorMessage } from './AlertMessage';

describe('AlertMessage', () => {
    it('SuccessMessage renders with provided message text', () => {
        const { getByText } = render(<SuccessMessage message="Operation successful" />);
        expect(getByText('Operation successful')).toBeInTheDocument();
    });

    it('WarningMessage renders with provided message text', () => {
        const { getByText } = render(<WarningMessage message="Be careful" />);
        expect(getByText('Be careful')).toBeInTheDocument();
    });

    it('ErrorMessage renders with provided message text', () => {
        const { getByText } = render(<ErrorMessage message="Something went wrong" />);
        expect(getByText('Something went wrong')).toBeInTheDocument();
    });
});
