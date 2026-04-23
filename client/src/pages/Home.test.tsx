import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
    it('renders the APOLLO heading', () => {
        render(<Home />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('renders the tagline', () => {
        render(<Home />);
        expect(screen.getByText('Banking made easy.')).toBeInTheDocument();
    });

    it('applies the primary background color', () => {
        const { container } = render(<Home />);
        const root = container.firstChild as HTMLElement;
        expect(root).toHaveStyle({ backgroundColor: '#222B2D' });
    });
});
