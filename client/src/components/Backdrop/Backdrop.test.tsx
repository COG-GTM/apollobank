import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Backdrop } from './Backdrop';

describe('Backdrop', () => {
    it('should render a div element', () => {
        const mockClick = jest.fn();
        const { container } = render(<Backdrop click={mockClick} />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should call click handler when clicked', () => {
        const mockClick = jest.fn();
        const { container } = render(<Backdrop click={mockClick} />);
        fireEvent.click(container.firstChild as Element);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });
});
