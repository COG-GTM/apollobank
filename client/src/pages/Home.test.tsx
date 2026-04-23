import React from 'react';
import { render } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
    it('renders "APOLLO" text', () => {
        const { getByText } = render(<Home />);
        expect(getByText('APOLLO')).toBeInTheDocument();
    });

    it('renders "Banking made easy." text', () => {
        const { getByText } = render(<Home />);
        expect(getByText('Banking made easy.')).toBeInTheDocument();
    });
});
