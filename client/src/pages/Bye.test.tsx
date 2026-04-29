import React from 'react';
import { render, screen } from '@testing-library/react';
import { Bye } from './Bye';

describe('Bye', () => {
    it('should render the goodbye message', () => {
        render(<Bye />);
        expect(screen.getByText("We're sad to see you go :(")).toBeInTheDocument();
    });

    it('should render a link back to the home page', () => {
        render(<Bye />);
        const link = screen.getByText('here');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
    });

    it('should render the return message', () => {
        render(<Bye />);
        expect(screen.getByText(/return back to the home page/)).toBeInTheDocument();
    });
});
