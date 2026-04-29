import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionCard } from './TransactionCard';

describe('TransactionCard', () => {
    const defaultProps = {
        title: 'payment',
        amount: '150.00',
        time: '1/15/2021',
        card: '1234 5678 9012 3456',
        transactionIcon: <span data-testid="tx-icon">Icon</span>,
        currencyIcon: '€',
    };

    it('should render the transaction title', () => {
        render(<TransactionCard {...defaultProps} />);
        expect(screen.getByText('payment')).toBeInTheDocument();
    });

    it('should render the transaction time', () => {
        render(<TransactionCard {...defaultProps} />);
        expect(screen.getByText('1/15/2021')).toBeInTheDocument();
    });

    it('should render the transaction icon', () => {
        render(<TransactionCard {...defaultProps} />);
        expect(screen.getByTestId('tx-icon')).toBeInTheDocument();
    });

    it('should render expand button', () => {
        render(<TransactionCard {...defaultProps} />);
        const expandButton = screen.getByLabelText('show more');
        expect(expandButton).toBeInTheDocument();
    });

    it('should show card and amount details when expanded', () => {
        render(<TransactionCard {...defaultProps} />);
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('1234 5678 9012 3456')).toBeInTheDocument();
        expect(screen.getByText(/150\.00/)).toBeInTheDocument();
    });
});
