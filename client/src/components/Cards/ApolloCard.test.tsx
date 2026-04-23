import React from 'react';
import { render, screen } from '@testing-library/react';
import { ApolloCard, NoApolloCard } from './ApolloCard';
import { fireEvent } from '@testing-library/react';

jest.mock('../../assets/mc_symbol.svg', () => ({
    ReactComponent: () => <div data-testid="mastercard-svg" />,
}));

describe('ApolloCard', () => {
    it('renders card number, valid thru date, and cvv', () => {
        render(
            <ApolloCard cardNumber="4111 1111 1111 1111" validThru="12/25" cvv={123} />
        );
        expect(screen.getByText('4111 1111 1111 1111')).toBeInTheDocument();
        expect(screen.getByText('12/25')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
    });
});

describe('NoApolloCard', () => {
    it('renders "Create new card" button', () => {
        const onClick = jest.fn();
        render(<NoApolloCard onCreateNewCardClicked={onClick} />);
        expect(screen.getByText('Create new card')).toBeInTheDocument();
    });

    it('calls onCreateNewCardClicked when button is clicked', () => {
        const onClick = jest.fn();
        render(<NoApolloCard onCreateNewCardClicked={onClick} />);
        fireEvent.click(screen.getByText('Create new card'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
