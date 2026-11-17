import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { Route, Router } from 'react-router-dom';
import * as graphql from '../../generated/graphql';
import { Account } from './Account';
import { accountFromRoute } from './accountFromRoute';

jest.mock('../../generated/graphql', () => {
    const mutation = () => [jest.fn()];
    return {
        useCreateTransactionMutation: mutation,
        useAddMoneyMutation: mutation,
        useExchangeMutation: mutation,
        useDeleteAccountMutation: mutation,
        useMeQuery: () => ({ data: undefined }),
        useCardsQuery: () => ({ data: undefined }),
        useTransactionsQuery: () => ({ data: undefined }),
        useAccountQuery: jest.fn(),
        useAccountsQuery: jest.fn(),
    };
});

const mocked = graphql as jest.Mocked<typeof graphql>;

const euroAccount = {
    id: 1,
    currency: 'EUR',
    balance: 25055,
    sortCode: '12-34-56',
    iban: 'GB00 EURO 0001',
    bic: 'APOLGB2L',
};

const renderAt = (path: string, state?: object) => {
    const history = createMemoryHistory();
    history.push(path, state);
    return render(
        <Router history={history}>
            <Route exact path="/accounts/:id" component={Account} />
        </Router>,
    );
};

describe('accountFromRoute', () => {
    it('uses the account passed in history state', () => {
        // Arrange
        const state = { currency: 'GBP', balance: 10 };

        // Act
        const result = accountFromRoute(state, [euroAccount], '1');

        // Assert
        expect(result).toBe(state);
    });

    it('looks the account up by the route id when there is no state', () => {
        // Act
        const result = accountFromRoute(undefined, [euroAccount], '1');

        // Assert
        expect(result).toBe(euroAccount);
    });

    it('returns undefined when no account has the route id', () => {
        // Act
        const result = accountFromRoute(undefined, [euroAccount], '99');

        // Assert
        expect(result).toBeUndefined();
    });
});

describe('Account page', () => {
    beforeEach(() => {
        mocked.useAccountQuery.mockReturnValue({ data: undefined } as any);
    });

    it('renders the account when /accounts/:id is opened directly', () => {
        // Arrange
        mocked.useAccountsQuery.mockReturnValue({
            data: { accounts: [euroAccount] },
            loading: false,
        } as any);

        // Act
        renderAt('/accounts/1');

        // Assert
        expect(screen.getByText('Euro')).toBeInTheDocument();
        expect(mocked.useAccountQuery).toHaveBeenLastCalledWith({
            variables: { id: 1 },
            skip: false,
        });
    });

    it('queries the account by route id, so two accounts in one currency stay distinct', () => {
        // Arrange
        const firstUsd = { id: 1, currency: 'USD', balance: 1000, iban: 'IBAN-1', bic: 'BIC-1' };
        const secondUsd = { id: 2, currency: 'USD', balance: 20506, iban: 'IBAN-2', bic: 'BIC-2' };
        mocked.useAccountsQuery.mockReturnValue({
            data: { accounts: [firstUsd, secondUsd] },
            loading: false,
        } as any);

        // Act
        renderAt('/accounts/1');

        // Assert
        expect(mocked.useAccountQuery).toHaveBeenLastCalledWith({
            variables: { id: 1 },
            skip: false,
        });
    });

    it('still uses the account passed in history state', () => {
        // Arrange
        mocked.useAccountsQuery.mockReturnValue({ data: undefined, loading: true } as any);

        // Act
        renderAt('/accounts/3', { currency: 'GBP', balance: 4456 });

        // Assert
        expect(screen.getByText('British Pound')).toBeInTheDocument();
    });

    it('shows a not-found message instead of a blank page for an unknown id', () => {
        // Arrange
        mocked.useAccountsQuery.mockReturnValue({
            data: { accounts: [euroAccount] },
            loading: false,
        } as any);

        // Act
        renderAt('/accounts/99');

        // Assert
        expect(screen.getByText('This account could not be found.')).toBeInTheDocument();
        expect(mocked.useAccountQuery).toHaveBeenLastCalledWith({
            variables: { id: 99 },
            skip: true,
        });
    });
});
