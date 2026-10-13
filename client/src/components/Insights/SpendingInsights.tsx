import Skeleton from '@material-ui/lab/Skeleton';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useSpendingInsightsQuery } from '../../generated/graphql';
import { ColorScheme } from '../../utils/theme';
import { useSpendingInsightsStyles } from './SpendingInsights.style';

interface SpendingInsightsProps {
    currency: string;
    days?: number;
}

const CATEGORY_COLORS: string[] = [
    ColorScheme.ORANGE,
    ColorScheme.SECONDARY,
    ColorScheme.MAROON,
    '#F2A541',
    ColorScheme.PRIMARY,
];

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const formatPercent = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const formatDay = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
    });
};

export const SpendingInsights: React.FC<SpendingInsightsProps> = ({ currency, days = 30 }) => {
    const classes = useSpendingInsightsStyles();

    const { data, loading, error } = useSpendingInsightsQuery({
        variables: { currency, days },
        fetchPolicy: 'cache-and-network',
    });

    const money = new Intl.NumberFormat(undefined, { style: 'currency', currency });
    const formatMoney = (value: number): string => money.format(value);

    const header = (
        <div className={classes.header}>
            <div className={classes.title}>Spending insights</div>
            <div className={classes.subtitle}>
                {currency} · last {days} days
            </div>
        </div>
    );

    if (loading && !data) {
        return (
            <div className={classes.root} data-testid="spending-insights-skeleton">
                {header}
                <div className={classes.kpis}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="rect" height={78} />
                    ))}
                </div>
                <div className={classes.charts}>
                    <Skeleton variant="rect" height={280} />
                    <Skeleton variant="rect" height={280} />
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className={classes.root}>
                {header}
                <div className={`${classes.message} ${classes.error}`} role="alert">
                    Couldn't load spending insights. Please try again later.
                </div>
            </div>
        );
    }

    const insights = data?.spendingInsights;

    if (!insights || !insights.largestTransaction) {
        return (
            <div className={classes.root}>
                {header}
                <div className={classes.message}>No transactions in the last {days} days</div>
            </div>
        );
    }

    const {
        totalIn,
        totalOut,
        net,
        largestTransaction,
        changeVsPreviousPeriodPct,
        categories,
        daily,
    } = insights;

    const change = changeVsPreviousPeriodPct;
    // More spending than the previous period is bad, so it is shown in orange.
    const changeClass =
        change === null || change === undefined || change === 0
            ? ''
            : change > 0
              ? classes.negative
              : classes.positive;

    const kpis: { label: string; value: string; hint?: string; className?: string }[] = [
        { label: 'Total in', value: formatMoney(totalIn) },
        { label: 'Total out', value: formatMoney(totalOut) },
        {
            label: 'Net',
            value: formatMoney(net),
            className: net < 0 ? classes.negative : net > 0 ? classes.positive : '',
        },
        {
            label: 'Biggest transaction',
            value: formatMoney(parseFloat(largestTransaction.amount)),
            hint: capitalize(largestTransaction.transactionType),
        },
        {
            label: 'Vs previous period',
            value: change === null || change === undefined ? '—' : formatPercent(change),
            hint: 'Change in money out',
            className: changeClass,
        },
    ];

    const pieData = categories.map((category) => ({
        name: capitalize(category.transactionType),
        value: category.total,
        share: category.share,
        count: category.count,
    }));

    const barData = daily.map((day) => ({
        date: formatDay(day.date),
        'Money in': day.moneyIn,
        'Money out': day.moneyOut,
    }));

    return (
        <div className={classes.root} data-testid="spending-insights">
            {header}
            {error && (
                <div className={classes.refreshError} role="alert">
                    Couldn't refresh spending insights. Showing the last loaded figures.
                </div>
            )}
            <div className={classes.kpis}>
                {kpis.map((kpi) => (
                    <div key={kpi.label} className={classes.kpi} data-testid="spending-kpi">
                        <div className={classes.kpiLabel}>{kpi.label}</div>
                        <div className={`${classes.kpiValue} ${kpi.className || ''}`}>
                            {kpi.value}
                        </div>
                        {kpi.hint && <div className={classes.kpiHint}>{kpi.hint}</div>}
                    </div>
                ))}
            </div>
            <div className={classes.charts}>
                <div className={classes.chartBox}>
                    <div className={classes.chartTitle}>Spending by type</div>
                    <div className={classes.chartBody}>
                        {totalOut <= 0 || pieData.length === 0 ? (
                            <div className={classes.message}>No spending in this period</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="55%"
                                        outerRadius="80%"
                                        paddingAngle={2}
                                    >
                                        {pieData.map((entry, i) => (
                                            <Cell
                                                key={entry.name}
                                                fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number, name: string, item: any) => [
                                            `${formatMoney(value)} (${Math.round(
                                                item.payload.share * 100,
                                            )}%)`,
                                            name,
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
                <div className={classes.chartBox}>
                    <div className={classes.chartTitle}>Daily money in / out</div>
                    <div className={classes.chartBody}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={16} />
                                <YAxis tick={{ fontSize: 11 }} width={56} />
                                <Tooltip formatter={(value: number) => formatMoney(value)} />
                                <Legend />
                                <Bar
                                    dataKey="Money in"
                                    stackId="daily"
                                    fill={ColorScheme.SECONDARY}
                                />
                                <Bar
                                    dataKey="Money out"
                                    stackId="daily"
                                    fill={ColorScheme.ORANGE}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
