import React from 'react';
import { render } from '@testing-library/react';
import { Chart } from './Chart';
import { useTransactionsQuery } from '../../generated/graphql';

jest.mock('../../generated/graphql', () => ({
    useTransactionsQuery: jest.fn(),
}));

const mockAreaChart = jest.fn();

jest.mock('recharts', () => {
    const Stub: React.FC = ({ children }) => <div>{children}</div>;
    return {
        Area: Stub,
        CartesianGrid: Stub,
        Legend: Stub,
        ResponsiveContainer: Stub,
        Tooltip: Stub,
        XAxis: Stub,
        YAxis: Stub,
        AreaChart: (props: { data: unknown[] }) => {
            mockAreaChart(props.data);
            return null;
        },
    };
});

describe('Chart', () => {
    it('plots spending oldest to newest, left to right', () => {
        // Arrange
        (useTransactionsQuery as jest.Mock).mockReturnValue({
            data: {
                transactions: [
                    {
                        id: 2,
                        transactionType: 'invoice',
                        date: '2026-11-20T10:00:00.000Z',
                        amount: '20',
                    },
                    {
                        id: 3,
                        transactionType: 'payment',
                        date: '2026-11-10T10:00:00.000Z',
                        amount: '30',
                    },
                    {
                        id: 1,
                        transactionType: 'deposit',
                        date: '2026-11-01T10:00:00.000Z',
                        amount: '10',
                    },
                ],
            },
        });

        // Act
        render(<Chart currency="EUR" />);

        // Assert
        const plotted = mockAreaChart.mock.calls[0][0] as { type: string }[];
        expect(plotted.map((point) => point.type)).toEqual(['deposit', 'payment', 'invoice']);
    });
});
