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

export const Chart: React.FC<ChartProps> = ({ currency }) => {
    // GraphQL queries
    const { data } = useTransactionsQuery({
        variables: { currency: currency },
    });

    const classes = useChartStyles();

    return (
        <>
            <div className={classes.root}>
                <div className={classes.spending}>Spending (this month)</div>
                <ResponsiveContainer width="100%">
                    <AreaChart
                        data={
                            !!data
                                ? data.transactions.map((transaction: Transaction) => {
                                      return {
                                          date: new Date(
                                              Date.parse(transaction.date),
                                          ).toLocaleDateString(),
                                          type: transaction.transactionType,
                                          amount: transaction.amount,
                                      };
                                  })
                                : []
                        }
                        margin={{
                            top: 24,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="amount" stroke="#29AABB" fill="#29AABB" />
                        <Area type="monotone" dataKey="type" stroke="#F15742" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};
