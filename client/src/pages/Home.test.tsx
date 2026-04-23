import React from 'react';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';
import { ColorScheme } from '../utils/theme';

describe('Home', () => {
    it('renders without crashing', () => {
        render(<Home />);
    });

    it('displays "APOLLO" text', () => {
        render(<Home />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('displays "Banking made easy." text', () => {
        render(<Home />);
        expect(screen.getByText('Banking made easy.')).toBeInTheDocument();
    });

    it('has correct background color', () => {
        const { container } = render(<Home />);
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv).toHaveStyle({ backgroundColor: ColorScheme.PRIMARY });
    });
});
