import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SpendingInsightsDocument, SpendingInsightsQuery } from '../../generated/graphql';
import { SpendingInsights } from './SpendingInsights';

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}

const money = (value: number, currency = 'EUR'): string =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

type Insights = NonNullable<SpendingInsightsQuery['spendingInsights']>;

const buildInsights = (overrides: Partial<Insights> = {}): Insights => ({
    __typename: 'SpendingInsights',
    currency: 'EUR',
    totalIn: 1500,
    totalOut: 640.5,
    net: 859.5,
    largestTransaction: {
        __typename: 'Transaction',
        id: 7,
        transactionType: 'payment',
        date: '2026-10-10T09:00:00.000Z',
        amount: '420.25',
    },
    changeVsPreviousPeriodPct: 12.5,
    categories: [
        {
            __typename: 'SpendingCategory',
            transactionType: 'payment',
            total: 500.5,
            count: 3,
            share: 0.78,
        },
        {
            __typename: 'SpendingCategory',
            transactionType: 'withdrawal',
            total: 140,
            count: 2,
            share: 0.22,
        },
    ],
    daily: [
        { __typename: 'DailySpend', date: '2026-10-12', moneyIn: 0, moneyOut: 140 },
        { __typename: 'DailySpend', date: '2026-10-13', moneyIn: 1500, moneyOut: 500.5 },
    ],
    ...overrides,
});

const successMock = (
    spendingInsights: Insights | null,
    variables = { currency: 'EUR', days: 30 },
): MockedResponse => ({
    request: { query: SpendingInsightsDocument, variables },
    result: { data: { spendingInsights } },
});

const renderPanel = (mocks: MockedResponse[], currency = 'EUR') =>
    render(
        <MockedProvider mocks={mocks}>
            <SpendingInsights currency={currency} />
        </MockedProvider>,
    );

describe('SpendingInsights', () => {
    beforeAll(() => {
        (window as any).ResizeObserver = ResizeObserverStub;
    });

    it('shows a loading skeleton while the query is in flight', () => {
        // Arrange
        renderPanel([successMock(buildInsights())]);

        // Assert
        expect(screen.getByTestId('spending-insights-skeleton')).toBeInTheDocument();
    });

    it('queries with the selected currency and a 30 day window, then renders the KPI tiles', async () => {
        // Arrange
        const mock = successMock(buildInsights({ currency: 'USD' }), {
            currency: 'USD',
            days: 30,
        });

        // Act
        renderPanel([mock], 'USD');

        // Assert
        expect(await screen.findByText('Total in')).toBeInTheDocument();
        expect(screen.getByText(money(1500, 'USD'))).toBeInTheDocument();
        expect(screen.getByText(money(640.5, 'USD'))).toBeInTheDocument();
        expect(screen.getByText(money(859.5, 'USD'))).toBeInTheDocument();
        expect(screen.getByText(money(420.25, 'USD'))).toBeInTheDocument();
        expect(screen.getByText('Payment')).toBeInTheDocument();
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getAllByTestId('spending-kpi')).toHaveLength(5);
        expect(screen.getByText('Spending by type')).toBeInTheDocument();
        expect(screen.getByText('Daily money in / out')).toBeInTheDocument();
    });

    it('shows an em dash when there is no previous period to compare against', async () => {
        // Arrange
        renderPanel([successMock(buildInsights({ changeVsPreviousPeriodPct: null }))]);

        // Act
        await screen.findByText('Vs previous period');

        // Assert
        expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('shows the empty state when the user has no account in that currency', async () => {
        // Arrange
        renderPanel([successMock(null)]);

        // Assert
        expect(await screen.findByText('No transactions in the last 30 days')).toBeInTheDocument();
        expect(screen.queryByTestId('spending-kpi')).not.toBeInTheDocument();
    });

    it('shows the empty state when there are no transactions in the window', async () => {
        // Arrange
        renderPanel([
            successMock(
                buildInsights({
                    totalIn: 0,
                    totalOut: 0,
                    net: 0,
                    largestTransaction: null,
                    changeVsPreviousPeriodPct: null,
                    categories: [],
                }),
            ),
        ]);

        // Assert
        expect(await screen.findByText('No transactions in the last 30 days')).toBeInTheDocument();
        expect(screen.queryByTestId('spending-kpi')).not.toBeInTheDocument();
    });

    it('keeps the KPI tiles but shows "No spending in this period" when there is no money out', async () => {
        // Arrange
        renderPanel([
            successMock(
                buildInsights({
                    totalOut: 0,
                    net: 1500,
                    largestTransaction: {
                        __typename: 'Transaction',
                        id: 9,
                        transactionType: 'deposit',
                        date: '2026-10-11T09:00:00.000Z',
                        amount: '1500',
                    },
                    changeVsPreviousPeriodPct: null,
                    categories: [],
                }),
            ),
        ]);

        // Assert
        expect(await screen.findByText('No spending in this period')).toBeInTheDocument();
        expect(screen.getAllByTestId('spending-kpi')).toHaveLength(5);
        expect(screen.getByText('Deposit')).toBeInTheDocument();
    });

    it('shows an error message when the query fails', async () => {
        // Arrange
        renderPanel([
            {
                request: {
                    query: SpendingInsightsDocument,
                    variables: { currency: 'EUR', days: 30 },
                },
                error: new Error('Network down'),
            },
        ]);

        // Assert
        expect(await screen.findByRole('alert')).toHaveTextContent(
            "Couldn't load spending insights",
        );
    });
});
