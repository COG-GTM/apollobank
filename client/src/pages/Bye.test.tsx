import React from 'react';
import { render } from '@testing-library/react';
import { Bye } from './Bye';

describe('Bye', () => {
    it('renders "We\'re sad to see you go" text', () => {
        const { getByText } = render(<Bye />);
        expect(getByText(/We're sad to see you go/)).toBeInTheDocument();
    });

    it('renders a link to home page "/"', () => {
        const { getByText } = render(<Bye />);
        const link = getByText('here');
        expect(link.closest('a')).toHaveAttribute('href', '/');
    });
});
