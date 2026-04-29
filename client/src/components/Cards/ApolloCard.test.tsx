import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApolloCard, NoApolloCard } from './ApolloCard';

jest.mock('../../assets/mc_symbol.svg', () => ({
    ReactComponent: () => <div data-testid="mastercard-icon">MC</div>,
}));

describe('ApolloCard', () => {
    it('should render the card number', () => {
        render(<ApolloCard cardNumber="1234 5678 9012 3456" validThru="12/25" cvv={123} />);
        expect(screen.getByText('1234 5678 9012 3456')).toBeInTheDocument();
    });

    it('should render the valid thru date', () => {
        render(<ApolloCard cardNumber="1234 5678 9012 3456" validThru="12/25" cvv={123} />);
        expect(screen.getByText('12/25')).toBeInTheDocument();
    });

    it('should render the cvv', () => {
        render(<ApolloCard cardNumber="1234 5678 9012 3456" validThru="12/25" cvv={123} />);
        expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should render valid thru and cvv labels', () => {
        render(<ApolloCard cardNumber="1234 5678 9012 3456" validThru="12/25" cvv={123} />);
        expect(screen.getByText('valid thru')).toBeInTheDocument();
        expect(screen.getByText('cvv')).toBeInTheDocument();
    });

    it('should render the logo emoji', () => {
        render(<ApolloCard cardNumber="1234 5678 9012 3456" validThru="12/25" cvv={123} />);
        expect(screen.getByRole('img', { name: 'logo' })).toBeInTheDocument();
    });
});

describe('NoApolloCard', () => {
    it('should render the create new card button', () => {
        const mockClick = jest.fn();
        render(<NoApolloCard onCreateNewCardClicked={mockClick} />);
        expect(screen.getByText('Create new card')).toBeInTheDocument();
    });

    it('should call onCreateNewCardClicked when button is clicked', () => {
        const mockClick = jest.fn();
        render(<NoApolloCard onCreateNewCardClicked={mockClick} />);
        fireEvent.click(screen.getByText('Create new card'));
        expect(mockClick).toHaveBeenCalledTimes(1);
    });
});
