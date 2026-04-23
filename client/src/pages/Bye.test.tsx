import React from 'react';
import { render, screen } from '@testing-library/react';
import { Bye } from './Bye';

describe('Bye page', () => {
    it('renders without crashing', () => {
        render(<Bye />);
    });

    it('displays "We\'re sad to see you go :(" text', () => {
        render(<Bye />);
        expect(screen.getByText("We're sad to see you go :(")).toBeInTheDocument();
    });

    it('contains a link to the home page with href="/"', () => {
        render(<Bye />);
        const link = screen.getByRole('link', { name: /here/i });
        expect(link).toHaveAttribute('href', '/');
    });

    it('link has the correct text "here"', () => {
        render(<Bye />);
        const link = screen.getByRole('link');
        expect(link).toHaveTextContent('here');
    });

    it('displays the instruction text about returning to the home page', () => {
        render(<Bye />);
        expect(
            screen.getByText(/to return back to the home page/i)
        ).toBeInTheDocument();
    });
});
