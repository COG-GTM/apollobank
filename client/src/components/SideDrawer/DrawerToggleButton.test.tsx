import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { DrawerToggleButton } from './DrawerToggleButton';

jest.mock('./DrawerToggleButton.style', () => ({
    useDrawerToggleButtonStyles: () => ({
        toggleButton: 'toggleButton',
        toggleButtonLine: 'toggleButtonLine',
    }),
}));

describe('DrawerToggleButton', () => {
    it('renders three toggle button lines', () => {
        const click = jest.fn();
        const { container } = render(<DrawerToggleButton click={click} />);
        const lines = container.querySelectorAll('.toggleButtonLine');
        expect(lines).toHaveLength(3);
    });

    it('calls click handler when button is clicked', () => {
        const click = jest.fn();
        const { container } = render(<DrawerToggleButton click={click} />);
        const button = container.querySelector('button')!;
        fireEvent.click(button);
        expect(click).toHaveBeenCalledTimes(1);
    });
});
