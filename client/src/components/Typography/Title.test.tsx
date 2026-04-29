import React from 'react';
import { render, screen } from '@testing-library/react';
import { Title } from './Title';

describe('Title', () => {
    it('should render the title text', () => {
        render(<Title title="Test Title" fontSize={24} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should apply the correct font size', () => {
        render(<Title title="Sized Title" fontSize={18} />);
        const element = screen.getByText('Sized Title');
        expect(element).toHaveStyle({ fontSize: 18 });
    });

    it('should apply bold font weight', () => {
        render(<Title title="Bold Title" fontSize={14} />);
        const element = screen.getByText('Bold Title');
        expect(element).toHaveStyle({ fontWeight: 'bold' });
    });
});
