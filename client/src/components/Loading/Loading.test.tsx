import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
    it('should render a loading image', () => {
        render(<Loading />);
        const img = screen.getByAltText('Loading...');
        expect(img).toBeInTheDocument();
    });

    it('should have correct src attribute', () => {
        render(<Loading />);
        const img = screen.getByAltText('Loading...') as HTMLImageElement;
        expect(img.src).toContain('loading.svg');
    });
});
