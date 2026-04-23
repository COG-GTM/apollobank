import React from 'react';
import { render, screen } from '@testing-library/react';
import { Bye } from './Bye';

describe('Bye', () => {
    it('renders the farewell message', () => {
        render(<Bye />);
        expect(screen.getByText("We're sad to see you go :(")).toBeInTheDocument();
    });

    it('renders a link with href="/" pointing to the home page', () => {
        render(<Bye />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/');
    });

    it('has link text that says "here"', () => {
        render(<Bye />);
        const link = screen.getByRole('link', { name: 'here' });
        expect(link).toBeInTheDocument();
    });

    it('applies the correct color style (#29AABB) to the link', () => {
        render(<Bye />);
        const link = screen.getByRole('link', { name: 'here' });
        expect(link).toHaveStyle({ color: '#29AABB' });
    });
});
