import React from 'react';
import { render, screen } from '@testing-library/react';
import { Toolbar } from './Toolbar';
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

describe('Toolbar', () => {
    const mockDrawerClickHandler = jest.fn();

    beforeEach(() => {
        mockUseLogoutMutation.mockReturnValue([jest.fn(), { client: { resetStore: jest.fn() } }]);
    });

    it('should render the toolbar with logo', () => {
        mockUseMeQuery.mockReturnValue({ data: null, loading: false });
        renderWithRouter(<Toolbar drawerClickHandler={mockDrawerClickHandler} />);
        expect(screen.getByRole('img', { name: 'logo' })).toBeInTheDocument();
    });

    it('should render Login and Sign Up buttons when user is not authenticated', () => {
        mockUseMeQuery.mockReturnValue({ data: null, loading: false });
        renderWithRouter(<Toolbar drawerClickHandler={mockDrawerClickHandler} />);
        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should render Dashboard, Settings, and Logout when user is authenticated', () => {
        mockUseMeQuery.mockReturnValue({
            data: { me: { id: 1, firstName: 'John', lastName: 'Doe' } },
            loading: false,
        });
        renderWithRouter(<Toolbar drawerClickHandler={mockDrawerClickHandler} />);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should render the header element', () => {
        mockUseMeQuery.mockReturnValue({ data: null, loading: false });
        const { container } = renderWithRouter(
            <Toolbar drawerClickHandler={mockDrawerClickHandler} />,
        );
        expect(container.querySelector('header')).toBeInTheDocument();
    });
});
