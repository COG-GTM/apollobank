import React from 'react';
import { render } from '@testing-library/react';
import { Chart } from './Chart';

jest.mock('./Chart.style', () => ({
    useChartStyles: () => ({
        root: 'root',
        spending: 'spending',
    }),
}));

const mockUseTransactionsQuery = jest.fn();
jest.mock('../../generated/graphql', () => ({
    useTransactionsQuery: (...args: any[]) => mockUseTransactionsQuery(...args),
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

describe('Chart', () => {
    beforeEach(() => {
        mockUseTransactionsQuery.mockReturnValue({
            data: {
                transactions: [
                    { date: '2021-01-01', transactionType: 'debit', amount: 100 },
                    { date: '2021-01-02', transactionType: 'credit', amount: 200 },
                ],
            },
        });
    });

    it('renders the spending title', () => {
        const { getByText } = render(<Chart currency="GBP" />);
        expect(getByText('Spending (this month)')).toBeInTheDocument();
    });

    it('renders the chart container', () => {
        const { getByTestId } = render(<Chart currency="GBP" />);
        expect(getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('renders with no data', () => {
        mockUseTransactionsQuery.mockReturnValue({ data: undefined });
        const { getByText } = render(<Chart currency="GBP" />);
        expect(getByText('Spending (this month)')).toBeInTheDocument();
    });
});
