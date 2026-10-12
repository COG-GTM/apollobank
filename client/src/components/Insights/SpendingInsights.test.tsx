import { render, screen } from '@testing-library/react';
import React from 'react';
import { useSpendingInsightsQuery } from '../../generated/graphql';
import { SpendingInsights } from './SpendingInsights';

jest.mock('../../generated/graphql', () => ({
    useSpendingInsightsQuery: jest.fn(),
}));

// recharts' ResponsiveContainer relies on ResizeObserver, which jsdom doesn't provide
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}
(window as any).ResizeObserver = ResizeObserverStub;

const mockUseSpendingInsightsQuery = useSpendingInsightsQuery as jest.Mock;

const formatMoney = (value: number, currency: string = 'EUR'): string =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

const insightsFixture = {
    __typename: 'SpendingInsights',
    currency: 'EUR',
    totalIn: 1500,
    totalOut: 600,
    net: 900,
    changeVsPreviousPeriodPct: 25,
    largestTransaction: {
        __typename: 'Transaction',
        id: 7,
        transactionType: 'deposit',
        date: '2026-10-01T10:00:00.000Z',
        amount: '1000',
    },
    categories: [
        {
            __typename: 'SpendingCategory',
            transactionType: 'payment',
            total: 400,
            count: 2,
            share: 0.6667,
        },
        {
            __typename: 'SpendingCategory',
            transactionType: 'withdrawal',
            total: 200,
            count: 1,
            share: 0.3333,
        },
    ],
    daily: [
        { __typename: 'DailySpend', date: '2026-10-01', moneyIn: 1000, moneyOut: 0 },
        { __typename: 'DailySpend', date: '2026-10-02', moneyIn: 500, moneyOut: 600 },
    ],
};

describe('SpendingInsights', () => {
    beforeEach(() => {
        mockUseSpendingInsightsQuery.mockReset();
    });

    it('queries the last 30 days for the given currency', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({ data: undefined, loading: true });

        // Act
        render(<SpendingInsights currency="USD" />);

        // Assert
        expect(mockUseSpendingInsightsQuery).toHaveBeenCalledWith({
            variables: { currency: 'USD', days: 30 },
        });
    });

    it('renders a loading skeleton while the query is loading', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({ data: undefined, loading: true });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText('Spending Insights (last 30 days)')).toBeInTheDocument();
        expect(screen.getByTestId('spending-insights-loading')).toBeInTheDocument();
    });

    it('renders the KPI tiles from the query result', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({
            data: { spendingInsights: insightsFixture },
            loading: false,
        });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText('Total in')).toBeInTheDocument();
        expect(screen.getByText(formatMoney(1500))).toBeInTheDocument();
        expect(screen.getByText('Total out')).toBeInTheDocument();
        expect(screen.getByText(formatMoney(600))).toBeInTheDocument();
        expect(screen.getByText('Net')).toBeInTheDocument();
        expect(screen.getByText(formatMoney(900))).toBeInTheDocument();
        expect(screen.getByText('Largest transaction')).toBeInTheDocument();
        expect(screen.getByText(formatMoney(1000))).toBeInTheDocument();
        expect(screen.getByText('deposit')).toBeInTheDocument();
        expect(screen.getByText('+25.0%')).toBeInTheDocument();
    });

    it('shows a dash when there is no previous period to compare against', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({
            data: {
                spendingInsights: { ...insightsFixture, changeVsPreviousPeriodPct: null },
            },
            loading: false,
        });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText('Change vs previous period')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('renders the empty state when there are no transactions', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({
            data: {
                spendingInsights: {
                    ...insightsFixture,
                    totalIn: 0,
                    totalOut: 0,
                    net: 0,
                    largestTransaction: null,
                    changeVsPreviousPeriodPct: null,
                    categories: [],
                },
            },
            loading: false,
        });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText(/No transactions in the last 30 days yet/)).toBeInTheDocument();
        expect(screen.queryByText('Total in')).not.toBeInTheDocument();
    });

    it('renders the empty state when spendingInsights is null', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({
            data: { spendingInsights: null },
            loading: false,
        });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText(/No transactions in the last 30 days yet/)).toBeInTheDocument();
    });

    it('renders an error message when the query fails', () => {
        // Arrange
        mockUseSpendingInsightsQuery.mockReturnValue({
            data: undefined,
            loading: false,
            error: new Error('Network error'),
        });

        // Act
        render(<SpendingInsights currency="EUR" />);

        // Assert
        expect(screen.getByText(/Couldn't load spending insights/)).toBeInTheDocument();
    });
});
