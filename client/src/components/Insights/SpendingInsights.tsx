import { Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
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
}

const INSIGHTS_DAYS: number = 30;

const CATEGORY_COLOURS: string[] = [
    ColorScheme.SECONDARY,
    ColorScheme.ORANGE,
    '#F2C14E',
    '#5C6BC0',
    '#7CB342',
    ColorScheme.MAROON,
];

const formatShortDate = (isoDate: string): string => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
    });
};

const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
        return '—';
    }
    const sign: string = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

interface KpiTileProps {
    label: string;
    value: string;
    subValue?: string;
    valueClassName?: string;
}

const KpiTile: React.FC<KpiTileProps> = ({ label, value, subValue, valueClassName }) => {
    const classes = useSpendingInsightsStyles();
    return (
        <div className={classes.tile}>
            <div className={classes.tileLabel}>{label}</div>
            <div className={classes.tileValue + (valueClassName ? ' ' + valueClassName : '')}>
                {value}
            </div>
            {subValue && <div className={classes.tileSubValue}>{subValue}</div>}
        </div>
    );
};

export const SpendingInsights: React.FC<SpendingInsightsProps> = ({ currency }) => {
    // GraphQL queries
    const { data, loading, error } = useSpendingInsightsQuery({
        variables: { currency: currency, days: INSIGHTS_DAYS },
        // Time-windowed totals: always revalidate so new transactions show on remount
        fetchPolicy: 'cache-and-network',
    });

    const classes = useSpendingInsightsStyles();

    const formatMoney = (value: number): string => {
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
        } catch {
            return value.toFixed(2);
        }
    };

    const renderTitle = (): JSX.Element => (
        <div className={classes.title}>Spending Insights (last {INSIGHTS_DAYS} days)</div>
    );

    if (loading && !data) {
        return (
            <div className={classes.root} data-testid="spending-insights-loading">
                {renderTitle()}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {[0, 1, 2, 3, 4].map((i: number) => (
                                <Grid key={i} item xs={6} sm={4} md>
                                    <Skeleton variant="rect" height={72} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Skeleton variant="rect" height={300} />
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Skeleton variant="rect" height={300} />
                    </Grid>
                </Grid>
            </div>
        );
    }

    if (error) {
        return (
            <div className={classes.root}>
                {renderTitle()}
                <div className={classes.message + ' ' + classes.error}>
                    Couldn't load spending insights. Please try again later.
                </div>
            </div>
        );
    }

    const insights = data ? data.spendingInsights : null;

    if (!insights || !insights.largestTransaction) {
        return (
            <div className={classes.root}>
                {renderTitle()}
                <div className={classes.message}>
                    No transactions in the last {INSIGHTS_DAYS} days yet. Make a transaction to see
                    your spending insights here.
                </div>
            </div>
        );
    }

    const change = insights.changeVsPreviousPeriodPct;
    let changeClassName: string | undefined;
    if (change !== null && change !== undefined && change !== 0) {
        // More spending than last period is shown as "up" (red), less as "down" (teal)
        changeClassName = change > 0 ? classes.up : classes.down;
    }

    const largest = insights.largestTransaction;

    const dailyData = insights.daily.map((d) => ({
        date: formatShortDate(d.date),
        moneyIn: d.moneyIn,
        moneyOut: d.moneyOut,
    }));

    const tooltipFormatter = (value: number | string): string =>
        formatMoney(typeof value === 'number' ? value : parseFloat(value));

    return (
        <div className={classes.root}>
            {renderTitle()}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={4} md>
                            <KpiTile label="Total in" value={formatMoney(insights.totalIn)} />
                        </Grid>
                        <Grid item xs={6} sm={4} md>
                            <KpiTile label="Total out" value={formatMoney(insights.totalOut)} />
                        </Grid>
                        <Grid item xs={6} sm={4} md>
                            <KpiTile label="Net" value={formatMoney(insights.net)} />
                        </Grid>
                        <Grid item xs={6} sm={6} md>
                            <KpiTile
                                label="Largest transaction"
                                value={
                                    largest
                                        ? formatMoney(Math.abs(parseFloat(largest.amount)))
                                        : '—'
                                }
                                subValue={largest ? largest.transactionType : undefined}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md>
                            <KpiTile
                                label="Change vs previous period"
                                value={formatPercent(change)}
                                valueClassName={changeClassName}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} md={5}>
                    <div className={classes.chartTitle}>Spending by category</div>
                    <div className={classes.chart}>
                        {insights.categories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={insights.categories}
                                        dataKey="total"
                                        nameKey="transactionType"
                                        innerRadius="55%"
                                        outerRadius="80%"
                                        paddingAngle={2}
                                    >
                                        {insights.categories.map((category, index: number) => (
                                            <Cell
                                                key={category.transactionType}
                                                fill={
                                                    CATEGORY_COLOURS[
                                                        index % CATEGORY_COLOURS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={tooltipFormatter} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className={classes.message}>No spending in this period.</div>
                        )}
                    </div>
                </Grid>
                <Grid item xs={12} md={7}>
                    <div className={classes.chartTitle}>Daily money in / out</div>
                    <div className={classes.chart}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={dailyData}
                                margin={{ top: 8, right: 16, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" minTickGap={12} />
                                <YAxis />
                                <Tooltip formatter={tooltipFormatter} />
                                <Legend />
                                <Bar
                                    dataKey="moneyIn"
                                    name="Money in"
                                    stackId="flow"
                                    fill={ColorScheme.SECONDARY}
                                />
                                <Bar
                                    dataKey="moneyOut"
                                    name="Money out"
                                    stackId="flow"
                                    fill={ColorScheme.ORANGE}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};
