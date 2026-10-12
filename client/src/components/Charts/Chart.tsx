import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Transaction, useTransactionsQuery } from '../../generated/graphql';
import { useChartStyles } from './Chart.style';

interface ChartProps {
    currency: string;
}

export interface ChartDataPoint {
    timestamp: number;
    date: string;
    moneyOut: number;
    moneyIn: number;
}

type ChartTransaction = Pick<Transaction, 'transactionType' | 'date' | 'amount'>;

const MONEY_IN_TYPES: string[] = ['deposit'];
const MONEY_OUT_TYPES: string[] = ['withdrawal', 'payment', 'invoice'];

const MONEY_OUT_COLOUR: string = '#29AABB';
const MONEY_IN_COLOUR: string = '#F15742';

const startOfDay = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const buildChartData = (transactions: ChartTransaction[]): ChartDataPoint[] => {
    const pointsByDay: Map<number, ChartDataPoint> = new Map();

    transactions.forEach((transaction: ChartTransaction) => {
        const date: Date = new Date(transaction.date);
        const amount: number = Number(transaction.amount);
        const type: string = transaction.transactionType.toLowerCase();
        const isMoneyIn: boolean = MONEY_IN_TYPES.includes(type);
        const isMoneyOut: boolean = MONEY_OUT_TYPES.includes(type);

        if (isNaN(date.getTime()) || !isFinite(amount) || (!isMoneyIn && !isMoneyOut)) {
            return;
        }

        const day: number = startOfDay(date);
        const point: ChartDataPoint = pointsByDay.get(day) || {
            timestamp: day,
            date: new Date(day).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            moneyOut: 0,
            moneyIn: 0,
        };

        if (isMoneyIn) {
            point.moneyIn += amount;
        } else {
            point.moneyOut += amount;
        }

        pointsByDay.set(day, point);
    });

    return Array.from(pointsByDay.values()).sort(
        (a: ChartDataPoint, b: ChartDataPoint) => a.timestamp - b.timestamp,
    );
};

export const createCurrencyFormatter = (
    currency: string,
    options: Intl.NumberFormatOptions = {},
): ((value: number) => string) => {
    try {
        const formatter: Intl.NumberFormat = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            ...options,
        });
        return (value: number) => formatter.format(value);
    } catch {
        const formatter: Intl.NumberFormat = new Intl.NumberFormat(undefined, options);
        return (value: number) => formatter.format(value);
    }
};

export const Chart: React.FC<ChartProps> = ({ currency }) => {
    // GraphQL queries
    const { data, loading } = useTransactionsQuery({
        variables: { currency: currency },
    });

    const classes = useChartStyles();

    const transactions: ChartTransaction[] = (data && data.transactions) || [];
    const chartData: ChartDataPoint[] = buildChartData(transactions);

    const formatAxisValue = createCurrencyFormatter(currency, { maximumFractionDigits: 0 });
    const formatTooltipValue = createCurrencyFormatter(currency);

    const renderEmptyState = (): JSX.Element => (
        <div className={classes.emptyState}>
            No transactions yet — add one from the account page
        </div>
    );

    const renderChart = (): JSX.Element => (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={chartData}
                margin={{
                    top: 40,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value: number) => formatAxisValue(value)} width={80} />
                <Tooltip formatter={(value: number) => formatTooltipValue(value)} />
                <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
                <Area
                    type="monotone"
                    dataKey="moneyOut"
                    name="Money out"
                    stroke={MONEY_OUT_COLOUR}
                    fill={MONEY_OUT_COLOUR}
                    fillOpacity={0.4}
                />
                <Area
                    type="monotone"
                    dataKey="moneyIn"
                    name="Money in"
                    stroke={MONEY_IN_COLOUR}
                    fill={MONEY_IN_COLOUR}
                    fillOpacity={0.2}
                />
            </AreaChart>
        </ResponsiveContainer>
    );

    return (
        <div className={classes.root}>
            <div className={classes.spending}>Spending (this month)</div>
            <div className={classes.chartArea}>
                {!loading && transactions.length === 0 ? renderEmptyState() : renderChart()}
            </div>
        </div>
    );
};
