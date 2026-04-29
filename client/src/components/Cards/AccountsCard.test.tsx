import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountsCard, NoAccountsCard } from './AccountsCard';

describe('AccountsCard', () => {
    const defaultProps = {
        svg: <div data-testid="currency-svg">SVG</div>,
        currencyIcon: '€',
        fullCurrencyText: 'Euro',
        balance: 1500,
        iban: 'IE12 APLO 0099 1234 5678 90',
        onAccountClicked: jest.fn(),
    };

    it('should render the full currency text', () => {
        render(<AccountsCard {...defaultProps} />);
        expect(screen.getByText('Euro')).toBeInTheDocument();
    });

    it('should render the currency icon and balance together', () => {
        render(<AccountsCard {...defaultProps} />);
        expect(screen.getByText(/€/)).toBeInTheDocument();
        expect(screen.getByText(/1500/)).toBeInTheDocument();
    });

    it('should render the iban when provided', () => {
        render(<AccountsCard {...defaultProps} />);
        expect(screen.getByText('IE12 APLO 0099 1234 5678 90')).toBeInTheDocument();
    });

    it('should render placeholder iban when empty', () => {
        render(<AccountsCard {...defaultProps} iban="" />);
        expect(screen.getByText('XXXX APL0 0099 YYYY ZZZZ 78')).toBeInTheDocument();
    });

    it('should render the svg element', () => {
        render(<AccountsCard {...defaultProps} />);
        expect(screen.getByTestId('currency-svg')).toBeInTheDocument();
    });

    it('should call onAccountClicked when navigate button is clicked', () => {
        render(<AccountsCard {...defaultProps} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(defaultProps.onAccountClicked).toHaveBeenCalledTimes(1);
    });
});

describe('NoAccountsCard', () => {
    it('should render the create new account button', () => {
        const mockClick = jest.fn();
        render(<NoAccountsCard onCreateNewAccountClicked={mockClick} />);
        expect(screen.getByText('Create new account')).toBeInTheDocument();
    });

    it('should call onCreateNewAccountClicked when button is clicked', () => {
        const mockClick = jest.fn();
        render(<NoAccountsCard onCreateNewAccountClicked={mockClick} />);
        fireEvent.click(screen.getByText('Create new account'));
        expect(mockClick).toHaveBeenCalledTimes(1);
    });
});
