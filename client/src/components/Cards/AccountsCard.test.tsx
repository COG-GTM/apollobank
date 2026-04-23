import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountsCard, NoAccountsCard } from './AccountsCard';

describe('AccountsCard', () => {
    const defaultProps = {
        svg: <div data-testid="flag-svg" />,
        currencyIcon: '$',
        fullCurrencyText: 'US Dollar',
        balance: 1500,
        iban: 'IE12 BOFI 9000 0112 3456 78',
        onAccountClicked: jest.fn(),
    };

    it('renders currency text, balance, and iban', () => {
        render(<AccountsCard {...defaultProps} />);
        expect(screen.getByText('US Dollar')).toBeInTheDocument();
        expect(screen.getByText('1500', { exact: false })).toBeInTheDocument();
        expect(screen.getByText('IE12 BOFI 9000 0112 3456 78')).toBeInTheDocument();
    });

    it('calls onAccountClicked when navigate button is clicked', () => {
        render(<AccountsCard {...defaultProps} />);
        const navigateButton = screen.getByRole('button');
        fireEvent.click(navigateButton);
        expect(defaultProps.onAccountClicked).toHaveBeenCalledTimes(1);
    });
});

describe('NoAccountsCard', () => {
    it('renders "Create new account" button', () => {
        const onClick = jest.fn();
        render(<NoAccountsCard onCreateNewAccountClicked={onClick} />);
        expect(screen.getByText('Create new account')).toBeInTheDocument();
    });

    it('calls onCreateNewAccountClicked when button is clicked', () => {
        const onClick = jest.fn();
        render(<NoAccountsCard onCreateNewAccountClicked={onClick} />);
        fireEvent.click(screen.getByText('Create new account'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
