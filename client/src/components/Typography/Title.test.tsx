import React from 'react';
import { render } from '@testing-library/react';
import { Title } from './Title';

describe('Title', () => {
    it('renders the title text', () => {
        const { getByText } = render(<Title title="Hello World" fontSize={24} />);
        expect(getByText('Hello World')).toBeInTheDocument();
    });

    it('renders with correct font size style', () => {
        const { getByText } = render(<Title title="Test Title" fontSize={32} />);
        const element = getByText('Test Title');
        expect(element).toHaveStyle({ fontSize: 32 });
    });
});
