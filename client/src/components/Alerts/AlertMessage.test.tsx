import React from 'react';
import { render, screen } from '@testing-library/react';
import { SuccessMessage, WarningMessage, ErrorMessage } from './AlertMessage';

describe('SuccessMessage', () => {
    it('should render the success message text', () => {
        render(<SuccessMessage message="Operation successful" />);
        expect(screen.getByText('Operation successful')).toBeInTheDocument();
    });

    it('should render with success severity', () => {
        const { container } = render(<SuccessMessage message="Done" />);
        const alert = container.querySelector('.MuiAlert-outlinedSuccess');
        expect(alert).toBeInTheDocument();
    });
});

describe('WarningMessage', () => {
    it('should render the warning message text', () => {
        render(<WarningMessage message="Be careful" />);
        expect(screen.getByText('Be careful')).toBeInTheDocument();
    });

    it('should render with warning severity', () => {
        const { container } = render(<WarningMessage message="Warning" />);
        const alert = container.querySelector('.MuiAlert-outlinedWarning');
        expect(alert).toBeInTheDocument();
    });
});

describe('ErrorMessage', () => {
    it('should render the error message text', () => {
        render(<ErrorMessage message="Something went wrong" />);
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render with error severity', () => {
        const { container } = render(<ErrorMessage message="Error" />);
        const alert = container.querySelector('.MuiAlert-outlinedError');
        expect(alert).toBeInTheDocument();
    });
});
