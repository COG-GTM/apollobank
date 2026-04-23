import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionCard } from './TransactionCard';

describe('TransactionCard', () => {
    const defaultProps = {
        title: 'Coffee Shop',
        time: '10:30 AM',
        amount: '4.50',
        card: '4111 **** **** 1111',
        transactionIcon: <span>IC</span>,
        currencyIcon: '$',
    };

    it('renders transaction title and time', () => {
        render(<TransactionCard {...defaultProps} />);
        expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
        expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    });

    it('reveals card and amount details when expand button is clicked', () => {
        render(<TransactionCard {...defaultProps} />);
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('4111 **** **** 1111')).toBeInTheDocument();
        expect(screen.getByText('4.50', { exact: false })).toBeInTheDocument();
    });
});
