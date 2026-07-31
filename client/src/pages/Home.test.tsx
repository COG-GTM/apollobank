import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
    it('renders the "APOLLO" brand text', () => {
        render(<Home />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('renders the "Banking made easy." tagline', () => {
        render(<Home />);
        expect(screen.getByText('Banking made easy.')).toBeInTheDocument();
    });

    it('has the correct background color (#222B2D)', () => {
        const { container } = render(<Home />);
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv).toHaveStyle({ backgroundColor: '#222B2D' });
    });
});
