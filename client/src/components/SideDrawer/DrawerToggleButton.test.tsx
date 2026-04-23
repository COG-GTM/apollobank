import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DrawerToggleButton } from './DrawerToggleButton';

describe('DrawerToggleButton', () => {
    it('should render a button element', () => {
        const mockClick = jest.fn();
        const { container } = render(<DrawerToggleButton click={mockClick} />);
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
    });

    it('should render three toggle lines', () => {
        const mockClick = jest.fn();
        const { container } = render(<DrawerToggleButton click={mockClick} />);
        const button = container.querySelector('button');
        expect(button?.children.length).toBe(3);
    });

    it('should call click handler when clicked', () => {
        const mockClick = jest.fn();
        const { container } = render(<DrawerToggleButton click={mockClick} />);
        const button = container.querySelector('button') as HTMLButtonElement;
        fireEvent.click(button);
        expect(mockClick).toHaveBeenCalledTimes(1);
    });
});
