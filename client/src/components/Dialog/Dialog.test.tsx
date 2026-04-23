import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
    it('should render children when isOpen is true', () => {
        render(
            <Dialog isOpen={true} onClose={jest.fn()}>
                <p>Dialog content</p>
            </Dialog>,
        );
        expect(screen.getByText('Dialog content')).toBeInTheDocument();
    });

    it('should not render children when isOpen is false', () => {
        render(
            <Dialog isOpen={false} onClose={jest.fn()}>
                <p>Dialog content</p>
            </Dialog>,
        );
        expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    });

    it('should render a close button when open', () => {
        render(
            <Dialog isOpen={true} onClose={jest.fn()}>
                <p>Content</p>
            </Dialog>,
        );
        expect(screen.getByText('x')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        const mockClose = jest.fn();
        render(
            <Dialog isOpen={true} onClose={mockClose}>
                <p>Content</p>
            </Dialog>,
        );
        fireEvent.click(screen.getByText('x'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });
});
