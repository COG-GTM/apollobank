import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
    it('when isOpen=true, renders children and close button', () => {
        const { getByText } = render(
            <Dialog isOpen={true} onClose={jest.fn()}>
                <p>Dialog content</p>
            </Dialog>
        );
        expect(getByText('Dialog content')).toBeInTheDocument();
        expect(getByText('x')).toBeInTheDocument();
    });

    it('when isOpen=false, does not render children', () => {
        const { queryByText } = render(
            <Dialog isOpen={false} onClose={jest.fn()}>
                <p>Dialog content</p>
            </Dialog>
        );
        expect(queryByText('Dialog content')).not.toBeInTheDocument();
    });

    it('close button calls onClose handler when clicked', () => {
        const handleClose = jest.fn();
        const { getByText } = render(
            <Dialog isOpen={true} onClose={handleClose}>
                <p>Content</p>
            </Dialog>
        );
        fireEvent.click(getByText('x'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
