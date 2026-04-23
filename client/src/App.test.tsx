import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

jest.mock('./Routes', () => ({
    Routes: () => <div data-testid="routes" />,
}));
jest.mock('./components/Loading/Loading', () => ({
    Loading: () => <div data-testid="loading" />,
}));
jest.mock('react-helmet', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
    Helmet: ({ children }: any) => <div>{children}</div>,
}));
jest.mock('./utils/accessToken', () => ({
    getAccessToken: jest.fn(),
    setAccessToken: jest.fn(),
}));

describe('App', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock) = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ accessToken: 'test-token' }),
            })
        ) as jest.Mock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows Loading initially', () => {
        render(<App />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders Routes after fetch resolves', async () => {
        render(<App />);
        await waitFor(() => {
            expect(screen.getByTestId('routes')).toBeInTheDocument();
        });
    });
});
