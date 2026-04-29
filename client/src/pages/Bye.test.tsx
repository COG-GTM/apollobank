import React from 'react';
import { render, screen } from '@testing-library/react';
import { Bye } from './Bye';

describe('Bye', () => {
    it('renders the goodbye message', () => {
        render(<Bye />);
        expect(screen.getByText("We're sad to see you go :(")).toBeInTheDocument();
    });

    it('renders a link back to the home page', () => {
        render(<Bye />);
        const link = screen.getByText('here');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders the return message text', () => {
        render(<Bye />);
        expect(screen.getByText(/return back to the home page/)).toBeInTheDocument();
    });

    it('styles the link with the secondary color', () => {
        render(<Bye />);
        const link = screen.getByText('here');
        expect(link).toHaveStyle({ color: '#29AABB' });
    });
});
