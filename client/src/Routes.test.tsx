import React from 'react';
import { render, screen } from '@testing-library/react';
import { Routes } from './Routes';
import { setAccessToken } from './utils/accessToken';

jest.mock('./generated/graphql', () => ({
    useMeQuery: jest.fn().mockReturnValue({ data: null, loading: false }),
    useLogoutMutation: jest.fn().mockReturnValue([
        jest.fn(),
        { client: { resetStore: jest.fn() } },
    ]),
}));

jest.mock('./components/Toolbar/Toolbar', () => ({
    Toolbar: () => <div data-testid="toolbar">Toolbar Mock</div>,
}));

jest.mock('./components/SideDrawer/SideDrawer', () => ({
    SideDrawer: () => <div data-testid="side-drawer">SideDrawer Mock</div>,
}));

describe('Routes', () => {
    afterEach(() => {
        setAccessToken('');
    });

    it('should render the Home page at root path', () => {
        render(<Routes />);
        expect(screen.getByText('APOLLO')).toBeInTheDocument();
    });

    it('should render the toolbar mock', () => {
        render(<Routes />);
        expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    it('should render the side drawer mock', () => {
        render(<Routes />);
        expect(screen.getByTestId('side-drawer')).toBeInTheDocument();
    });
});
