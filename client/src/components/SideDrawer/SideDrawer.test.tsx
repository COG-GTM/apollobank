import React from 'react';
import { render, screen } from '@testing-library/react';
import { SideDrawer } from './SideDrawer';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../generated/graphql', () => ({
    useMeQuery: jest.fn(),
    useLogoutMutation: jest.fn(),
}));

import { useMeQuery, useLogoutMutation } from '../../generated/graphql';

const mockUseMeQuery = useMeQuery as jest.Mock;
const mockUseLogoutMutation = useLogoutMutation as jest.Mock;

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('SideDrawer', () => {
    beforeEach(() => {
        mockUseLogoutMutation.mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);
    });

    it('should render non-auth navigation items when user is not logged in', () => {
        mockUseMeQuery.mockReturnValue({ data: null, loading: false });
        renderWithRouter(<SideDrawer show={true} />);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should render auth navigation items when user is logged in', () => {
        mockUseMeQuery.mockReturnValue({
            data: { me: { id: 1, firstName: 'John', lastName: 'Doe' } },
            loading: false,
        });
        renderWithRouter(<SideDrawer show={true} />);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render a nav element', () => {
        mockUseMeQuery.mockReturnValue({ data: null, loading: false });
        const { container } = renderWithRouter(<SideDrawer show={false} />);
        expect(container.querySelector('nav')).toBeInTheDocument();
    });
});
