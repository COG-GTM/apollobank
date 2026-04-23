import React from 'react';
import { render } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading', () => {
    it('renders without crashing', () => {
        render(<Loading />);
    });

    it('renders an img with alt text "Loading..."', () => {
        const { getByAltText } = render(<Loading />);
        const img = getByAltText('Loading...');
        expect(img).toBeInTheDocument();
        expect(img.tagName).toBe('IMG');
    });
});
