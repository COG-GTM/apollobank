import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
    it('should render the APOLLO heading', () => {
        render(<Home />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('should render the tagline', () => {
        render(<Home />);
        expect(screen.getByText('Banking made easy.')).toBeInTheDocument();
    });
});
