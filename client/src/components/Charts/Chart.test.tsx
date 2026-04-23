import React from 'react';
import { render, screen } from '@testing-library/react';
import { Chart } from './Chart';

jest.mock('../../generated/graphql', () => ({
    useTransactionsQuery: jest.fn(),
}));

jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
}));

import { useTransactionsQuery } from '../../generated/graphql';

const mockUseTransactionsQuery = useTransactionsQuery as jest.Mock;

describe('Chart', () => {
    it('should render the spending label', () => {
        mockUseTransactionsQuery.mockReturnValue({ data: undefined });
        render(<Chart currency="EUR" />);
        expect(screen.getByText('Spending (this month)')).toBeInTheDocument();
    });

    it('should render chart components', () => {
        mockUseTransactionsQuery.mockReturnValue({ data: undefined });
        render(<Chart currency="EUR" />);
        expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('should call useTransactionsQuery with the correct currency', () => {
        mockUseTransactionsQuery.mockReturnValue({ data: undefined });
        render(<Chart currency="USD" />);
        expect(mockUseTransactionsQuery).toHaveBeenCalledWith({
            variables: { currency: 'USD' },
        });
    });

    it('should render with transaction data', () => {
        mockUseTransactionsQuery.mockReturnValue({
            data: {
                transactions: [
                    { id: 1, transactionType: 'payment', date: '2021-01-15', amount: '100' },
                ],
            },
        });
        render(<Chart currency="EUR" />);
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
});
