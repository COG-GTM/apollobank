import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

jest.mock('./Routes', () => ({
    Routes: () => <div data-testid="routes">Routes</div>,
}));

describe('App', () => {
    beforeEach(() => {
        (global as any).fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ accessToken: 'test-token' }),
            }),
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should show loading initially', () => {
        render(<App />);
        expect(screen.getByAltText('Loading...')).toBeInTheDocument();
    });

    it('should render Routes after loading completes', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByTestId('routes')).toBeInTheDocument();
        });
    });

    it('should call refresh_token endpoint on mount', () => {
        render(<App />);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/refresh_token'),
            expect.objectContaining({
                method: 'POST',
                credentials: 'include',
            }),
        );
    });
});
