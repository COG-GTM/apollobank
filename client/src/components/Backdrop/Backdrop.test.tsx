import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Backdrop } from './Backdrop';

describe('Backdrop', () => {
    it('renders without crashing', () => {
        render(<Backdrop click={jest.fn()} />);
    });

    it('calls click handler when clicked', () => {
        const handleClick = jest.fn();
        const { container } = render(<Backdrop click={handleClick} />);
        fireEvent.click(container.firstChild as Element);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
